'use client';

import { useState } from 'react';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';

interface Book {
  title: string;
  author: string;
  year: string;
  description: string;
  rating: number;
  difficulty: string;
  tags: string[];
}

export default function BookFinder() {
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleFindBooks = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject to find books!');
      return;
    }

    setIsSearching(true);
    setBooks([]);

    try {
      const promptText = `Find the best books about "${subject}" ${level !== 'all' ? `for ${level} level readers` : ''}.
      
      Return a list of 5-7 highly recommended books on this subject. For each book, include:
      1. Title
      2. Author
      3. Publication year
      4. A brief description (2-3 sentences)
      5. Rating (1-5 stars)
      6. Difficulty level (Beginner, Intermediate, Advanced)
      7. Tags (2-4 relevant keywords)
      
      Format your response as a JSON array with the following structure:
      [
        {
          "title": "Book Title",
          "author": "Author Name",
          "year": "Publication Year",
          "description": "Brief description of the book",
          "rating": 4.5,
          "difficulty": "Intermediate",
          "tags": ["keyword1", "keyword2"]
        },
        ...
      ]
      
      Focus on books that are:
      - Highly regarded in their field
      - Well-written and accessible
      - Provide comprehensive coverage of the subject
      - Include both classic texts and recent publications
      
      Ensure the books represent diverse perspectives and approaches to the subject.`;
      
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
        throw new Error('Failed to parse book recommendations from response');
      }
      
      const parsedBooks = JSON.parse(jsonMatch[0]);
      
      // Validate and format the books
      if (!Array.isArray(parsedBooks) || parsedBooks.length === 0) {
        throw new Error('Invalid book recommendations format received');
      }
      
      setBooks(parsedBooks);
    } catch (error) {
      console.error('Error finding books:', error);
      alert('Sorry, there was an error finding book recommendations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-500">★</span>
        ))}
        {halfStar && <span className="text-yellow-500">½</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </div>
    );
  };

  // Function to get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              Book Finder
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover the best books for any subject or interest
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <label htmlFor="subject" className="block text-[#1a4d7c] text-sm font-medium">
                What subject are you interested in?
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Quantum Physics, Ancient Rome, Machine Learning, Creative Writing..."
                className={styles.messageInput}
                disabled={isSearching}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="level" className="block text-[#1a4d7c] text-sm font-medium">
                Reading Level
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className={styles.messageInput}
                disabled={isSearching}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleFindBooks}
                className={`${styles.navButton} flex-1 ${isSearching ? 'bg-[#1a4d7c]/80 animate-pulse' : ''}`}
                disabled={isSearching}
              >
                <span className="text-black font-bold">
                  {isSearching ? '🔄 Searching' : '🔄 Find Books'}
                </span>
              </button>
            </div>
            
            {isSearching && (
              <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-6 text-center">
                <div className="font-medium text-[#1a4d7c] text-xl mb-2 animate-pulse">Searching for the best books...</div>
                <div className="text-[#2d8a6b]">This may take a moment as we curate the perfect reading list for you.</div>
              </div>
            )}

            {books.length > 0 && (
              <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-6">
                <div className="font-medium text-[#1a4d7c] text-xl mb-4">Recommended Books on {subject}</div>
                
                <div className="space-y-6">
                  {books.map((book, index) => (
                    <div key={index} className="border-b border-[#1a4d7c]/10 pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-[#1a4d7c]">{book.title}</h3>
                        <div className="flex items-center">
                          {renderStars(book.rating)}
                        </div>
                      </div>
                      
                      <div className="text-[#2d8a6b] font-medium">
                        by {book.author} ({book.year})
                      </div>
                      
                      <p className="my-2 text-gray-700">{book.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(book.difficulty)}`}>
                          {book.difficulty}
                        </span>
                        
                        {book.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 rounded-full text-xs font-medium bg-[#1a4d7c]/10 text-[#1a4d7c]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-[#2d8a6b] space-y-1">
              <p>💡 Tip: Be specific about your subject for more targeted book recommendations.</p>
              <p>📚 Examples: "Renaissance Art", "Python Programming", "Climate Science", "Greek Mythology"</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 