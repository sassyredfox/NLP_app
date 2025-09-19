import React, { useState, useRef } from 'react';
import { Mic, MicOff, Square, Copy, Check, Volume2 } from 'lucide-react';
import { useNLP } from '../contexts/NLPContext';

const SpeechToText: React.FC = () => {
  const { addToHistory } = useNLP();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [copied, setCopied] = useState(false);
  const [confidence, setConfidence] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
              setConfidence(result[0].confidence);
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalTranscript) {
            setTranscript(prev => prev + finalTranscript);
          }
          setInterimTranscript(interimTranscript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
          setIsPaused(false);
          setInterimTranscript('');
        };
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      setIsPaused(false);
      recognitionRef.current.start();
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current && isRecording) {
      setIsPaused(true);
      recognitionRef.current.stop();
    }
  };

  const resumeRecording = () => {
    if (recognitionRef.current && isPaused) {
      setIsPaused(false);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && (isRecording || isPaused)) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setInterimTranscript('');
      
      if (transcript.trim()) {
        addToHistory({
          type: 'speech-to-text',
          input: 'Audio recording',
          output: transcript,
          metadata: {
            confidence: confidence || 0.95,
          },
        });
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakTranscript = () => {
    const utterance = new SpeechSynthesisUtterance(transcript);
    speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Speech to Text
        </h1>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <p className="text-yellow-800 dark:text-yellow-300">
            Speech recognition is not supported in your browser. Please use Chrome, Safari, or Edge for the best experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Speech to Text
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Convert spoken words to text with real-time transcription
        </p>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-6 mb-8">
          <div className="relative">
            <button
              onClick={isRecording ? (isPaused ? resumeRecording : pauseRecording) : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-medium transition-all duration-200 transform hover:scale-105 ${
                isRecording && !isPaused
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 animate-pulse'
                  : isPaused
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              }`}
            >
              {isRecording && !isPaused ? (
                <MicOff className="w-8 h-8" />
              ) : isPaused ? (
                <Mic className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
            
            {isRecording && !isPaused && (
              <div className="absolute -inset-2 rounded-full border-4 border-red-300 animate-ping"></div>
            )}
          </div>

          <div className="text-center">
            <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isRecording && !isPaused ? 'Recording...' : isPaused ? 'Paused' : 'Ready to Record'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isRecording && !isPaused ? 'Click to pause' : isPaused ? 'Click to resume' : 'Click the microphone to start'}
            </div>
          </div>

          {(isRecording || isPaused) && (
            <button
              onClick={stopRecording}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Square className="w-4 h-4" />
              <span>Stop Recording</span>
            </button>
          )}
        </div>

        {/* Transcript Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Transcript
            </h3>
            <div className="flex space-x-2">
              {transcript && (
                <>
                  <button
                    onClick={speakTranscript}
                    className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors duration-200"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors duration-200"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={clearTranscript}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="min-h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-500 dark:text-gray-400 italic">
                  {interimTranscript}
                </span>
              )}
              {!transcript && !interimTranscript && !isRecording && (
                <span className="text-gray-500 dark:text-gray-400">
                  Your transcribed text will appear here...
                </span>
              )}
            </p>
          </div>

          {confidence > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Confidence:</span>
              <div className="flex-1 max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${confidence * 100}%` }}
                ></div>
              </div>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Tips for better recognition:</h4>
          <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-1">
            <li>• Speak clearly and at a moderate pace</li>
            <li>• Use the microphone in a quiet environment</li>
            <li>• Allow microphone permissions when prompted</li>
            <li>• Pause briefly between sentences for better accuracy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;