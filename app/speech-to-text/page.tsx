'use client';

import { useState, useEffect, useRef } from 'react';

// Define TypeScript interfaces for the Web Speech API
interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: {
    readonly transcript: string;
    readonly confidence: number;
  };
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
}

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function SpeechTranscriptionPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Define language options
  const languageOptions = [
    { value: 'en-US', label: 'English' },
    { value: 'hy-AM', label: 'Armenian' },
    { value: 'ru-RU', label: 'Russian' },
  ];

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support the Web Speech API. Please try Chrome or Edge.');
      return;
    }

    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    // Initialize SpeechRecognition
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionConstructor();
    
    // Configure recognition
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    
    // Set up event handlers
    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };
    
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let currentInterimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += result;
        } else {
          currentInterimTranscript += result;
        }
      }
      
      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
      
      setInterimTranscript(currentInterimTranscript);
    };
    
    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    // Start recognition
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    // If currently listening, restart with new language
    if (isListening) {
      stopListening();
      setTimeout(() => startListening(), 100);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Speech Transcription</h1>
      
      <div className="mb-6">
        <label htmlFor="language" className="block text-sm font-medium mb-2">
          Select Language
        </label>
        <select
          id="language"
          value={language}
          onChange={handleLanguageChange}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={toggleListening}
          className={`px-4 py-2 rounded-md font-medium text-white ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        <button
          onClick={clearTranscript}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
        >
          Clear Text
        </button>
      </div>
      
      <div className="mb-2 flex items-center">
        <div className="mr-2 font-medium">Status:</div>
        <div className="flex items-center">
          <div 
            className={`w-3 h-3 rounded-full mr-2 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}
          />
          {isListening ? 'Listening...' : 'Not listening'}
        </div>
      </div>
      
      <div className="border border-gray-300 rounded-md p-4 min-h-[200px] bg-white">
        <p className="whitespace-pre-wrap">
          {transcript}
          <span className="text-gray-400">{interimTranscript}</span>
          {!transcript && !interimTranscript && (
            <span className="text-gray-400">Transcribed text will appear here...</span>
          )}
        </p>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Note: For best results, speak clearly and use a good microphone.</p>
        <p>The Web Speech API may require permission to access your microphone.</p>
      </div>
    </div>
  );
}

