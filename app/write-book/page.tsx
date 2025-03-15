'use client';

import { useCompletion } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';

export default function Chat() {
  const { completion, input, handleInputChange, handleSubmit, error, data } =
    useCompletion({ api: '/api/write-book' });

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
              AI Book Writer
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Generate creative stories and books with AI
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {data && (
              <pre className="p-4 mb-4 text-sm bg-white/80 backdrop-blur rounded-lg border border-[#1a4d7c]/20">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
            
            {error && (
              <div className="p-4 mb-4 text-red-700 bg-red-100/80 backdrop-blur border border-red-400 rounded-lg">
                {error.message}
              </div>
            )}
            
            <div className="prose prose-blue max-w-none mb-24">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-bold text-[#1a4d7c]" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold text-[#1a4d7c]" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-bold text-[#1a4d7c]" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="text-[#2d8a6b] mb-4" {...props} />
                  ),
                }}
              >
                {completion}
              </ReactMarkdown>
            </div>

            <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-2xl mb-8">
              <input
                className={styles.messageInput}
                value={input}
                placeholder="Enter your book topic or story idea..."
                onChange={handleInputChange}
              />
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
