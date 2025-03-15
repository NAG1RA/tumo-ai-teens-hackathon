'use client';

import { useState, useEffect, useRef } from 'react';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';

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
    <>
      <Bubbles />
      <div className={styles.pageContainer}>
        <div className="p-4">
          <Link href="/">
            <button className={styles.navButton}>
              <span className="text-black font-bold">← Back to Home</span>
            </button>
          </Link>
        </div>
        
        <div className={styles.chatContainer}>
          <div className="space-y-2 text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#1a4d7c]">
              Speech to Text
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Convert your speech into text in real-time
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <label htmlFor="language" className="block text-[#1a4d7c] text-sm font-medium mb-2">
                Select Language
              </label>
              <select
                id="language"
                value={language}
                onChange={handleLanguageChange}
                className={styles.messageInput}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={toggleListening}
                className={`${styles.navButton} flex-1`}
                disabled={isListening}
              >
                <span className="text-black font-bold">
                  {isListening ? '🔄 Recording...' : '🔄 Start Recording'}
                </span>
              </button>
              
              <button
                onClick={clearTranscript}
                className={`${styles.navButton} flex-1`}
                disabled={false}
              >
                <span className="text-black font-bold">
                  Clear Text
                </span>
              </button>
            </div>
            
            <div className="mb-4 flex items-center bg-white/80 backdrop-blur p-3 rounded-lg">
              <div className="mr-2 font-medium text-[#1a4d7c]">Status:</div>
              <div className="flex items-center">
                <div 
                  className={`w-3 h-3 rounded-full mr-2 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}
                />
                <span className={isListening ? 'text-red-500' : 'text-gray-500'}>
                  {isListening ? 'Listening...' : 'Not listening'}
                </span>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-4 min-h-[200px] shadow-lg">
              <p className="whitespace-pre-wrap">
                {transcript}
                <span className="text-[#2d8a6b]">{interimTranscript}</span>
                {!transcript && !interimTranscript && (
                  <span className="text-gray-400">Transcribed text will appear here...</span>
                )}
              </p>
            </div>
            
            <div className="mt-6 text-sm text-[#2d8a6b]">
              <p>Note: For best results, speak clearly and use a good microphone.</p>
              <p>The Web Speech API may require permission to access your microphone.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

