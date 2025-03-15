'use client';

import { useState, useRef } from 'react';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';

export default function TextToSpeechPage() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('nova');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const voices = [
    { value: 'alloy', label: 'Alloy' },
    { value: 'echo', label: 'Echo' },
    { value: 'fable', label: 'Fable' },
    { value: 'onyx', label: 'Onyx' },
    { value: 'nova', label: 'Nova' },
    { value: 'shimmer', label: 'Shimmer' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
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
              Text to Speech
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Convert your text into natural-sounding speech
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div>
              <label htmlFor="text" className="block text-[#1a4d7c] text-sm font-medium mb-2">
                Enter Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`${styles.messageInput} min-h-[150px] w-full`}
                placeholder="Enter the text you want to convert to speech..."
              />
            </div>
            
            <div>
              <label htmlFor="voice" className="block text-[#1a4d7c] text-sm font-medium mb-2">
                Select Voice
              </label>
              <select
                id="voice"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className={styles.messageInput}
              >
                {voices.map((voice) => (
                  <option key={voice.value} value={voice.value}>
                    {voice.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className={`${styles.navButton} flex-1`}
                disabled={isLoading}
              >
                <span className="text-black font-bold">
                  {isLoading ? '🔄 Generating' : '🔄 Generate'}
                </span>
              </button>
            </div>
            
            {error && (
              <div className="p-4 mb-4 text-red-700 bg-red-100/80 backdrop-blur border border-red-400 rounded-lg">
                {error}
              </div>
            )}
          </form>
          
          <div className="mt-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-[#1a4d7c]">Audio Player</h2>
            <audio ref={audioRef} controls className="w-full" />
          </div>
          
          <div className="mt-6 text-sm text-[#2d8a6b] max-w-2xl mx-auto">
            <p>Note: This feature uses OpenAI's text-to-speech API.</p>
            <p>The generated audio will play in the player above.</p>
          </div>
        </div>
      </div>
    </>
  );
}
