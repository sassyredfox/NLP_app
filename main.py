from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import base64
from google.cloud import texttospeech, speech

# ===============================
# CONFIGURATION
# ===============================
# 🔑 OpenRouter (DeepSeek)
OPENROUTER_API_KEY = "API_KEY"  #dump Replace with your key
OPENROUTER_URL = " "
OPENROUTER_HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json"
}

# 🔑 Google Cloud Service Account JSON
SERVICE_ACCOUNT_FILE = "FILE_LOCATION"

# Initialize Google clients from JSON
tts_client = texttospeech.TextToSpeechClient.from_service_account_file(SERVICE_ACCOUNT_FILE)
stt_client = speech.SpeechClient.from_service_account_file(SERVICE_ACCOUNT_FILE)

# ===============================
# FASTAPI INIT
# ===============================
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (adjust in prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# REQUEST MODELS
# ===============================
class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str

class SummarizeRequest(BaseModel):
    text: str
    length: str = "medium"

class TTSRequest(BaseModel):
    text: str
    voice_name: str = "en-US-Wavenet-D"
    language_code: str = "en-US"

class STTRequest(BaseModel):
    audio_content: str  # base64 audio

# ===============================
# HELPERS
# ===============================
def call_openrouter(prompt: str) -> str:
    payload = {
        "model": "deepseek/deepseek-chat-v3.1:free",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1000,
    }
    response = requests.post(OPENROUTER_URL, headers=OPENROUTER_HEADERS, json=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"OpenRouter error: {response.text}")
    data = response.json()
    return data['choices'][0]['message']['content']

# ===============================
# ROUTES
# ===============================
@app.get("/")
def root():
    return {"message": "🚀 NLP backend is running"}

# --- TRANSLATION ---
@app.post("/translate")
def translate(req: TranslationRequest):
    prompt = (
        f"Translate the following text from {req.source_lang} to {req.target_lang}.\n"
        "Respond with only the translated text.\n"
        f"Text:\n{req.text}"
    )
    translated = call_openrouter(prompt)
    return {"translation": translated.strip()}

# --- SUMMARIZATION ---
@app.post("/summarize")
def summarize(req: SummarizeRequest):
    length_desc = {
        "short": "Summarize the text in 2 lines.",
        "medium": "Summarize the text in 5 lines.",
        "long": "Summarize the text in 10 lines.",
    }.get(req.length.lower(), "Summarize the text in 5 lines.")

    prompt = f"{length_desc}\nText:\n{req.text}\nRespond only with the summary."
    summary = call_openrouter(prompt)
    return {"summary": summary.strip()}

# --- TEXT TO SPEECH (Google Cloud) ---
@app.post("/textToSpeech")
def text_to_speech(req: TTSRequest):
    try:
        synthesis_input = texttospeech.SynthesisInput(text=req.text)
        voice = texttospeech.VoiceSelectionParams(
            language_code=req.language_code,
            name=req.voice_name
        )
        audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        # Encode audio as base64 for frontend playback
        audio_base64 = base64.b64encode(response.audio_content).decode("utf-8")
        return {"audioContent": audio_base64}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

# --- SPEECH TO TEXT (Google Cloud) ---
@app.post("/speechToText")
def speech_to_text(req: STTRequest):
    try:
        audio = speech.RecognitionAudio(content=base64.b64decode(req.audio_content))
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            language_code="en-US"
        )

        response = stt_client.recognize(config=config, audio=audio)
        transcript = " ".join([result.alternatives[0].transcript for result in response.results])

        return {"transcription": transcript}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT error: {str(e)}")

