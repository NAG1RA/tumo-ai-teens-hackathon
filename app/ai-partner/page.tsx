'use client';

import { useState } from 'react';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';

export default function AIPartnerPage() {
  const [subject, setSubject] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitExplanation = async () => {
    if (!subject.trim()) {
      alert('Please enter the subject you want to explain first!');
      return;
    }

    if (!explanation.trim()) {
      alert('Please enter your explanation first!');
      return;
    }

    setIsSubmitting(true);
    setIsExplaining(true);

    try {
      const promptText = `As a friendly but critical study partner, give detailed feedback on this explanation of "${subject}":
      "${explanation}"
      
      Provide thorough and honest feedback with a critical eye:
      1. Identify specific weaknesses, gaps, or misconceptions in the explanation
      2. Point out any logical flaws or areas that lack clarity
      3. Suggest concrete improvements with examples of better phrasing
      4. Highlight what was done well, but focus more on what could be improved
      5. Rate the explanation on a scale of 1-10 and justify your rating
      
      Be direct and honest but still supportive. Don't sugar-coat your critique, but maintain a constructive tone.
      Your goal is to help your friend improve their explanation skills through honest feedback.`;
      
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
      
      const feedbackText = await response.text();
      console.log('Feedback response:', feedbackText);
      
      setFeedback(feedbackText || 'Sorry, I had trouble generating feedback. Please try again!');
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedback('Sorry, I had trouble generating feedback. Please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setExplanation('');
    setFeedback('');
    setIsExplaining(false);
  };

  return (
    <>
      <Bubbles />
      <div className={styles.pageContainer}>
        <div className="p-4">
          <Link href="/">
            <button className={styles.navButton}>
              <span className="text-black font-medium">← Back to Home</span>
            </button>
          </Link>
        </div>
        
        <div className={styles.chatContainer}>
          <div className="space-y-2 text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[#1a4d7c]">
              AI Study Partner
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Practice explaining concepts and get friendly feedback
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <label htmlFor="subject" className="block text-[#1a4d7c] text-sm font-medium">
                What would you like to explain?
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter the subject or concept you want to explain..."
                className={styles.messageInput}
                disabled={isExplaining}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="explanation" className="block text-[#1a4d7c] text-sm font-medium">
                Your Explanation
              </label>
              <textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Type your explanation here. Try to be clear and thorough..."
                className={`${styles.messageInput} min-h-[200px] w-full`}
                disabled={isExplaining && feedback}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmitExplanation}
                className={`${styles.navButton} flex-1`}
                disabled={isSubmitting}
              >
                <span className="text-black font-medium">
                  {isSubmitting ? '🔄 Generating' : '🔄 Generate'}
                </span>
              </button>
            </div>

            {feedback && (
              <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-4">
                <div className="font-medium text-[#1a4d7c] mb-2">Feedback from your AI Partner:</div>
                <div className="prose prose-blue max-w-none">
                  <p className="text-[#2d8a6b] whitespace-pre-wrap">{feedback}</p>
                </div>
              </div>
            )}

            <div className="text-sm text-[#2d8a6b] space-y-1">
              <p>💡 Tip: Try to organize your thoughts and be specific in your explanation.</p>
              <p>🎯 Goal: Practice explaining concepts clearly as if you're teaching a friend!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 