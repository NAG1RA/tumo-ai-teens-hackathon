'use client';

import { useState } from 'react';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';

export default function Page() {
  const [inputValue, setInputValue] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setImageSrc(null);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue }),
      });

      if (response.ok) {
        const data = await response.json();
        setImageSrc(data.imageUrl);
        return;
      }

      setError(await response.text());
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
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#1a4d7c]">
              Image Generator
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Create amazing images with AI
            </p>
          </div>

          <div className="w-full max-w-2xl mx-auto pt-6 pb-8 space-y-4">
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <input
                className={styles.messageInput}
                placeholder="Describe the image you want to create..."
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isLoading}
              />
            </form>

            <div className="flex gap-4">
              <button
                onClick={(e) => handleSubmit(e as any)}
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

            <div className="max-w-[512px] mx-auto">
              {isLoading ? (
                <div className="h-[512px] w-full animate-pulse bg-white/20 backdrop-blur rounded-lg" />
              ) : (
                imageSrc && (
                  <img
                    alt="Generated Image"
                    className="w-full h-auto object-cover overflow-hidden rounded-lg shadow-lg"
                    src={imageSrc}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
