'use client';

import { useState } from 'react';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';

export default function EssayGenerator() {
  const [topic, setTopic] = useState('');
  const [essayType, setEssayType] = useState('academic');
  const [wordCount, setWordCount] = useState(1000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [essayText, setEssayText] = useState('');

  const handleGenerateEssay = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic for your essay!');
      return;
    }

    setIsGenerating(true);
    setEssayText('');

    try {
      const promptText = `Generate a complete ${wordCount}-word ${essayType} essay on the topic: "${topic}".
      
      The essay should include:
      1. A title page with the title, author (Student), date, and course information
      2. An introduction with a clear thesis statement
      3. Well-structured body paragraphs with topic sentences, evidence, and analysis
      4. A conclusion that summarizes the main points and restates the thesis
      5. Proper citations and references (in APA format)
      
      Make the essay well-researched, logical, and academically sound.
      Include at least 3-5 main sections in the body.
      
      Format the essay as if it were a complete academic paper ready for submission.`;
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptText,
          stream: false
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const responseText = await response.text();
      setEssayText(responseText);
    } catch (error) {
      console.error('Error generating essay:', error);
      alert('Sorry, there was an error generating your essay. Please try again.');
    } finally {
      setIsGenerating(false);
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
              Essay Generator
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Generate complete essays with proper structure and formatting
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <label htmlFor="topic" className="block text-[#1a4d7c] text-sm font-medium">
                Essay Topic
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The Impact of Climate Change on Global Economies..."
                className={styles.messageInput}
                disabled={isGenerating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="essayType" className="block text-[#1a4d7c] text-sm font-medium">
                  Essay Type
                </label>
                <select
                  id="essayType"
                  value={essayType}
                  onChange={(e) => setEssayType(e.target.value)}
                  className={styles.messageInput}
                  disabled={isGenerating}
                >
                  <option value="academic">Academic</option>
                  <option value="argumentative">Argumentative</option>
                  <option value="expository">Expository</option>
                  <option value="narrative">Narrative</option>
                  <option value="descriptive">Descriptive</option>
                  <option value="compare-contrast">Compare & Contrast</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="wordCount" className="block text-[#1a4d7c] text-sm font-medium">
                  Word Count
                </label>
                <select
                  id="wordCount"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className={styles.messageInput}
                  disabled={isGenerating}
                >
                  <option value="500">500 words</option>
                  <option value="750">750 words</option>
                  <option value="1000">1000 words</option>
                  <option value="1500">1500 words</option>
                  <option value="2000">2000 words</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleGenerateEssay}
                className={`${styles.navButton} flex-1 ${isGenerating ? 'bg-[#1a4d7c]/80 animate-pulse' : ''}`}
                disabled={isGenerating}
              >
                <span className="text-black font-bold">
                  {isGenerating ? '🔄 Generating' : '🔄 Generate'}
                </span>
              </button>
            </div>
            
            {isGenerating && (
              <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-6 text-center">
                <div className="font-medium text-[#1a4d7c] text-xl mb-2 animate-pulse">Generating Your Essay...</div>
                <div className="text-[#2d8a6b]">This may take a minute or two depending on the length and complexity.</div>
              </div>
            )}

            {essayText && (
              <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-6">
                <div className="font-medium text-[#1a4d7c] text-xl mb-4">Your Essay:</div>
                <div className="bg-[#f0f7ff] p-4 rounded-lg text-[#1a4d7c] whitespace-pre-wrap overflow-y-auto">
                  {essayText}
                </div>
              </div>
            )}

            <div className="text-sm text-[#2d8a6b] space-y-1">
              <p>💡 Tip: Be specific with your topic for a more focused and detailed essay.</p>
              <p>📝 The essay will include a title page, introduction, body paragraphs, conclusion, and references.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 