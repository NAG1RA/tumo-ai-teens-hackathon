'use client';

import { useState } from 'react';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';

interface FlashCard {
  id: number;
  question: string;
  answer: string;
  flipped: boolean;
}

export default function FlashCardGenerator() {
  const [subject, setSubject] = useState('');
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleGenerateFlashCards = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject for your flash cards!');
      return;
    }

    setIsGenerating(true);
    setFlashCards([]);

    try {
      const promptText = `Generate 5 study flash cards for the subject: "${subject}".
      
      For each flash card:
      1. Create a clear, concise question that tests key knowledge about the subject
      2. Provide a comprehensive but concise answer
      
      Format your response as a JSON array with exactly 5 objects, each with 'question' and 'answer' properties.
      Example format:
      [
        {
          "question": "What is the capital of France?",
          "answer": "Paris"
        },
        {
          "question": "Second question here?",
          "answer": "Second answer here"
        }
      ]
      
      Make the questions challenging but appropriate for a student studying this subject.
      Ensure answers are factually correct and provide enough detail to be educational.`;
      
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
      
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to parse flash cards from response');
      }
      
      const parsedCards = JSON.parse(jsonMatch[0]);
      
      // Validate and format the cards
      if (!Array.isArray(parsedCards) || parsedCards.length === 0) {
        throw new Error('Invalid flash cards format received');
      }
      
      const formattedCards = parsedCards.slice(0, 5).map((card, index) => ({
        id: index + 1,
        question: card.question || `Question ${index + 1}`,
        answer: card.answer || 'No answer provided',
        flipped: false
      }));
      
      setFlashCards(formattedCards);
      setCurrentCardIndex(0);
    } catch (error) {
      console.error('Error generating flash cards:', error);
      alert('Sorry, there was an error generating your flash cards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const flipCard = (id: number) => {
    setFlashCards(prevCards => 
      prevCards.map(card => 
        card.id === id ? { ...card, flipped: !card.flipped } : card
      )
    );
  };

  const nextCard = () => {
    if (currentCardIndex < flashCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const resetAll = () => {
    setSubject('');
    setFlashCards([]);
    setCurrentCardIndex(0);
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
              Flash Card Generator
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Generate study flash cards for any subject
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <label htmlFor="subject" className="block text-[#1a4d7c] text-sm font-medium">
                Enter a Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., World War II, Photosynthesis, Calculus, Spanish vocabulary..."
                className={styles.messageInput}
                disabled={isGenerating}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleGenerateFlashCards}
                className={`${styles.navButton} flex-1 w-48`}
                disabled={isGenerating}
              >
                <span className="text-black font-bold">
                  {isGenerating ? '🔄 Generating' : '🔄 Generate'}
                </span>
              </button>
            </div>

            {flashCards.length > 0 && (
              <div className="mt-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#1a4d7c]">
                    Flash Cards for: {subject}
                  </h3>
                  <div className="text-[#2d8a6b]">
                    Card {currentCardIndex + 1} of {flashCards.length}
                  </div>
                </div>
                
                <div 
                  className="relative h-64 w-full cursor-pointer"
                  style={{ perspective: '1000px' }}
                  onClick={() => flipCard(flashCards[currentCardIndex].id)}
                >
                  <div 
                    className={`absolute w-full h-full transition-transform duration-500`}
                    style={{ 
                      transformStyle: 'preserve-3d',
                      transform: flashCards[currentCardIndex].flipped ? 'rotateY(180deg)' : ''
                    }}
                  >
                    {/* Front of card */}
                    <div 
                      className="absolute w-full h-full bg-white/90 backdrop-blur border-2 border-[#1a4d7c]/30 rounded-xl p-6 flex flex-col justify-center items-center"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="text-xl font-medium text-[#1a4d7c] text-center">
                        {flashCards[currentCardIndex].question}
                      </div>
                      <div className="mt-4 text-sm text-[#2d8a6b]">
                        (Click to reveal answer)
                      </div>
                    </div>
                    
                    {/* Back of card */}
                    <div 
                      className="absolute w-full h-full bg-[#f0f7ff]/90 backdrop-blur border-2 border-[#1a4d7c]/30 rounded-xl p-6 flex flex-col justify-center items-center"
                      style={{ 
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <div className="text-lg text-[#2d8a6b] text-center overflow-y-auto max-h-full">
                        {flashCards[currentCardIndex].answer}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <button 
                    onClick={prevCard}
                    disabled={currentCardIndex === 0}
                    className={`${styles.navButton} ${currentCardIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-black font-bold">← Previous</span>
                  </button>
                  <button 
                    onClick={nextCard}
                    disabled={currentCardIndex === flashCards.length - 1}
                    className={`${styles.navButton} ${currentCardIndex === flashCards.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-black font-bold">Next →</span>
                  </button>
                </div>
              </div>
            )}

            <div className="text-sm text-[#2d8a6b] space-y-1">
              <p>💡 Tip: Be specific about your subject to get more targeted flash cards.</p>
              <p>📚 Examples: "French Revolution key events", "JavaScript fundamentals", "Human anatomy - the nervous system"</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 