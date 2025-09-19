import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Square, Copy, Check } from 'lucide-react';
import { useNLP } from '../contexts/NLPContext';

interface VoiceOption {
  label: string;
  value: string;
}

const TextToSpeech: React.FC = () => {
  const { addToHistory } = useNLP();
  const [inputText, setInputText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voices: VoiceOption[] = [
    { label: 'Male US 1', value: 'en-US-Wavenet-D' },
    { label: 'Female US 1', value: 'en-US-Wavenet-C' },
    { label: 'Female British', value: 'en-GB-Wavenet-A' },
  ];

  const [selectedVoice, setSelectedVoice] = useState<string>(voices[0].value);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  // Fetch audio from backend and play automatically
  const handleSpeak = async () => {
    if (!inputText.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/textToSpeech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          voice_name: selectedVoice,
          language_code: 'en-US',
        }),
      });

      if (!response.ok) throw new Error('Backend error');

      const data = await response.json();
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const url = URL.createObjectURL(audioBlob);
      setAudioSrc(url);

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
          setIsPaused(false);

          addToHistory({
            type: 'text-to-speech',
            input: inputText,
            output: 'Audio generated successfully',
            metadata: { voice: selectedVoice },
          });
        }
      }, 100);
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setLoading(false);
    }
  };

  const pauseAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPaused(true);
  };

  const resumeAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setIsPaused(false);
  };

  const stopAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setIsPaused(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!audioRef.current) return;
    const audioEl = audioRef.current;
    const handleEnded = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    audioEl.addEventListener('ended', handleEnded);
    return () => audioEl.removeEventListener('ended', handleEnded);
  }, [audioSrc]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Text to Speech
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Transform text into natural-sounding speech with backend-generated MP3
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 ">
        {/* Text Input */}
        <div className="space-y-4 mb-6 ">
          <div className="flex items-center justify-between ">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 ">
              Text to Convert
            </h3>
            <div className="flex items-center space-x-4 ">
              <div className="text-sm text-gray-500 dark:text-gray-400 ">
                {wordCount} words, {charCount} characters
              </div>
              {inputText && (
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors duration-200"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            placeholder="Enter text to convert to speech..."
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize- no-scrollbar"
          />
        </div>

      <div className = "mb-6 flex items-center space-x-4 -mt-4">
        {/* Voice Selector */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Voice
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {voices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col items-center space-y-6 mt-4">
          <div className="mt-1">
            {!isPlaying ? (
              <button
                onClick={handleSpeak}
                disabled={!inputText.trim() || loading}
                  className="px-20 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg flex items-center justify-center hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Play className="w-6 h-6 ml-1" />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={isPaused ? resumeAudio : pauseAudio}
                  className="px-9 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg flex items-center justify-center hover:from-yellow-600 hover:to-orange-700 transition-all duration-200"
                >
                  {isPaused ? <Play className="w-5 h-5 ml-1" /> : <Pause className="w-5 h-5" />}
                </button>
                <button
                  onClick={stopAudio}
                  className="px-9 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg flex items-center justify-center hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                >
                  <Square className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {audioSrc && <audio ref={audioRef} src={audioSrc} />}
          {/* loading && <p className="text-gray-500 mt-2">Generating audio...</p> */}
        </div>
      </div>

        {/* Tips Section */}
        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="font-medium text-orange-900 dark:text-orange-300 mb-2">Tips for better speech:</h4>
          <ul className="text-sm text-orange-800 dark:text-orange-400 space-y-1">
            <li>• Use punctuation for natural pauses and intonation</li>
            <li>• Try different voices for various languages and accents</li>
            <li>• Longer texts may be interrupted by browser limits</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
