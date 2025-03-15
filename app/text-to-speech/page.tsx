'use client';

import { useState, useRef } from 'react';

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
      
      // Get the audio blob
      const audioBlob = await response.blob();
      
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set the audio source and play
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
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Text to Speech</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="text" className="block text-sm font-medium mb-2">
            Enter Text
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
            placeholder="Enter the text you want to convert to speech..."
          />
        </div>
        
        <div>
          <label htmlFor="voice" className="block text-sm font-medium mb-2">
            Select Voice
          </label>
          <select
            id="voice"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {voices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded-md font-medium text-white ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Speech'}
        </button>
        
        {error && (
          <div className="text-red-500 mt-2">
            {error}
          </div>
        )}
      </form>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Audio Player</h2>
        <audio ref={audioRef} controls className="w-full" />
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Note: This feature uses OpenAI's text-to-speech API.</p>
        <p>The generated audio will play in the player above.</p>
      </div>
    </div>
  );
}
