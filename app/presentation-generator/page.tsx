'use client';

import { useState } from 'react';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';

interface Slide {
  id: number;
  title: string;
  content: string[];
  notes?: string;
  image?: string;
}

export default function PresentationGenerator() {
  const [subject, setSubject] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [presentationTitle, setPresentationTitle] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentImageSlide, setCurrentImageSlide] = useState<number | null>(null);

  const handleGeneratePresentation = async () => {
    if (!subject.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate presentation');
      }

      const data = await response.json();
      setSlides(data.slides);
      setPresentationTitle(data.title);
      setCurrentSlide(0);
    } catch (error) {
      console.error('Error generating presentation:', error);
      alert('Sorry, there was an error generating your presentation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImageForSlide = async (slideIndex: number) => {
    if (isGeneratingImage) return;
    
    const slide = slides[slideIndex];
    setCurrentImageSlide(slideIndex);
    setIsGeneratingImage(true);
    
    try {
      // Create a prompt based on the slide content
      const imagePrompt = `Create a professional presentation image for a slide titled "${slide.title}" about ${subject}. The slide discusses: ${slide.content.join('. ')}`;
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      
      // Update the slides array with the new image
      const updatedSlides = [...slides];
      updatedSlides[slideIndex] = {
        ...updatedSlides[slideIndex],
        image: data.imageUrl
      };
      
      setSlides(updatedSlides);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Sorry, there was an error generating the image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
      setCurrentImageSlide(null);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
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
              Presentation Generator
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Create professional presentations with AI
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-lg p-6 shadow-sm">
              <div>
                <label htmlFor="subject" className="block text-[#1a4d7c] text-sm font-medium mb-2">
                  Presentation Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter your presentation topic..."
                  className={styles.messageInput}
                  disabled={isGenerating}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleGeneratePresentation}
                className={`${styles.navButton} flex-1`}
                disabled={isGenerating}
              >
                <span className="text-black font-bold">
                  {isGenerating ? '🔄 Generating' : '🔄 Generate'}
                </span>
              </button>
            </div>

            {isGenerating && (
              <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-6 text-center">
                <div className="font-medium text-[#1a4d7c] text-xl mb-2 animate-pulse">Creating your presentation...</div>
                <div className="text-[#2d8a6b]">Generating slides for your topic.</div>
              </div>
            )}

            {slides.length > 0 && (
              <div className="bg-white/90 backdrop-blur rounded-lg p-6 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#1a4d7c]">{presentationTitle}</h3>
                  <p className="text-[#2d8a6b]">Slide {currentSlide + 1} of {slides.length}</p>
                </div>

                <div className="min-h-[400px] bg-white rounded-lg p-8 shadow-inner">
                  <h4 className="text-xl font-bold text-[#1a4d7c] mb-4">
                    {slides[currentSlide].title}
                  </h4>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                      <ul className="space-y-2">
                        {slides[currentSlide].content.map((point, index) => (
                          <li key={index} className="text-gray-700 flex items-start gap-2">
                            <span className="text-[#2d8a6b]">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="md:w-1/2 flex flex-col items-center justify-center">
                      {slides[currentSlide].image ? (
                        <img 
                          src={slides[currentSlide].image} 
                          alt={`Illustration for ${slides[currentSlide].title}`}
                          className="max-w-full max-h-[250px] object-contain rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-full h-[200px] bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4">
                          <button
                            onClick={() => generateImageForSlide(currentSlide)}
                            disabled={isGeneratingImage}
                            className={`${styles.navButton} text-sm px-3 py-2 ${isGeneratingImage && currentImageSlide === currentSlide ? 'animate-pulse' : ''}`}
                          >
                            {isGeneratingImage && currentImageSlide === currentSlide 
                              ? '🔄 Generating image...' 
                              : '🖼️ Add image to slide'}
                          </button>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Generate an AI image related to this slide's content
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {slides[currentSlide].notes && (
                  <div className="mt-4 p-4 bg-[#f0f7ff] rounded-lg">
                    <p className="text-sm text-[#1a4d7c]">
                      <span className="font-medium">Speaker Notes:</span> {slides[currentSlide].notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    onClick={previousSlide}
                    disabled={currentSlide === 0}
                    className={`${styles.navButton} ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-black font-bold">← Previous</span>
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className={`${styles.navButton} ${currentSlide === slides.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-black font-bold">Next →</span>
                  </button>
                </div>
              </div>
            )}

            <div className="text-sm text-[#2d8a6b] space-y-1">
              <p>💡 Tip: Be specific about your subject to get more focused and detailed slides.</p>
              <p>📊 The presentation will include a title slide and multiple content slides with key points.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 