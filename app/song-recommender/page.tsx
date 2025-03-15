'use client';

import { useState } from 'react';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';

interface Song {
  title: string;
  artist: string;
  album?: string;
  year?: string;
  similarity?: string;
  genre?: string[];
}

export default function SongRecommender() {
  const [songInput, setSongInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [similarSongs, setSimilarSongs] = useState<Song[]>([]);
  const [inputSong, setInputSong] = useState<Song | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleFindSimilarSongs = async () => {
    if (!songInput.trim()) {
      alert('Please enter a song name!');
      return;
    }

    setIsSearching(true);
    setSimilarSongs([]);
    setInputSong(null);

    try {
      const promptText = `Find songs similar to "${songInput}"${artistInput ? ` by ${artistInput}` : ''}.
      
      First, identify the exact song the user is referring to and provide its details.
      Then, recommend 8-10 similar songs that fans of this song might enjoy.
      
      For the input song and each recommendation, include:
      1. Title
      2. Artist
      3. Album (if relevant)
      4. Year (if relevant)
      5. Similarity reason (brief explanation of why this song is similar)
      6. Genre tags (2-3 tags)
      
      Format your response as a JSON object with the following structure:
      {
        "inputSong": {
          "title": "Original Song Title",
          "artist": "Original Artist Name",
          "album": "Album Name",
          "year": "Release Year",
          "genre": ["genre1", "genre2"]
        },
        "similarSongs": [
          {
            "title": "Similar Song Title",
            "artist": "Artist Name",
            "album": "Album Name",
            "year": "Release Year",
            "similarity": "Brief explanation of similarity",
            "genre": ["genre1", "genre2"]
          },
          ...
        ]
      }
      
      Focus on finding songs that are similar in terms of:
      - Musical style and sound
      - Mood and atmosphere
      - Lyrical themes (if applicable)
      - Era or time period
      
      Include a mix of well-known and lesser-known tracks that a fan of the original song would likely enjoy.`;
      
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
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse song recommendations from response');
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validate and format the data
      if (!parsedData.inputSong || !Array.isArray(parsedData.similarSongs)) {
        throw new Error('Invalid song recommendations format received');
      }
      
      setInputSong(parsedData.inputSong);
      setSimilarSongs(parsedData.similarSongs);
    } catch (error) {
      console.error('Error finding similar songs:', error);
      alert('Sorry, there was an error finding similar songs. Please try again.');
    } finally {
      setIsSearching(false);
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
              Song Recommender
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover similar songs based on your favorites
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <label htmlFor="songInput" className="block text-[#1a4d7c] text-sm font-medium">
                Enter a song you like
              </label>
              <input
                id="songInput"
                type="text"
                value={songInput}
                onChange={(e) => setSongInput(e.target.value)}
                placeholder="e.g., Bohemian Rhapsody, Billie Jean, Stairway to Heaven..."
                className={styles.messageInput}
                disabled={isSearching}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="artistInput" className="block text-[#1a4d7c] text-sm font-medium">
                Artist (optional)
              </label>
              <input
                id="artistInput"
                type="text"
                value={artistInput}
                onChange={(e) => setArtistInput(e.target.value)}
                placeholder="e.g., Queen, Michael Jackson, Led Zeppelin..."
                className={styles.messageInput}
                disabled={isSearching}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleFindSimilarSongs}
                className={`${styles.navButton} flex-1 ${isSearching ? 'bg-[#1a4d7c]/80 animate-pulse' : ''}`}
                disabled={isSearching}
              >
                <span className="text-black font-bold">
                  {isSearching ? '🔄 Searching' : '🔄 Find Similar Songs'}
                </span>
              </button>
            </div>
            
            {isSearching && (
              <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-6 text-center">
                <div className="font-medium text-[#1a4d7c] text-xl mb-2 animate-pulse">Finding similar songs...</div>
                <div className="text-[#2d8a6b]">Searching for music that matches your taste.</div>
              </div>
            )}

            {inputSong && (
              <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-6">
                <div className="font-medium text-[#1a4d7c] text-xl mb-4">Based on your selection:</div>
                
                <div className="bg-[#1a4d7c]/10 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-[#1a4d7c]">{inputSong.title}</h3>
                  </div>
                  
                  <div className="text-[#2d8a6b] font-medium">
                    {inputSong.artist} {inputSong.album && `• ${inputSong.album}`} {inputSong.year && `(${inputSong.year})`}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {inputSong.genre && inputSong.genre.map((tag, tagIndex) => (
                      <span key={`genre-${tagIndex}`} className="px-2 py-1 rounded-full text-xs font-medium bg-[#1a4d7c]/20 text-[#1a4d7c]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="font-medium text-[#1a4d7c] text-lg mb-3">You might also like:</div>
                
                <div className="space-y-4">
                  {similarSongs.map((song, index) => (
                    <div key={index} className="flex items-start border-b border-[#1a4d7c]/10 pb-3 last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#1a4d7c] text-white rounded-full mr-3">
                        {index + 1}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-[#1a4d7c]">{song.title}</h3>
                        </div>
                        
                        <div className="text-[#2d8a6b] font-medium">
                          {song.artist} {song.album && `• ${song.album}`} {song.year && `(${song.year})`}
                        </div>
                        
                        {song.similarity && (
                          <div className="my-1 text-gray-700 text-sm italic">
                            {song.similarity}
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {song.genre && song.genre.map((tag, tagIndex) => (
                            <span key={`genre-${tagIndex}`} className="px-2 py-1 rounded-full text-xs font-medium bg-[#1a4d7c]/10 text-[#1a4d7c]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-[#2d8a6b] space-y-1">
              <p>💡 Tip: For better results, include both the song title and artist name.</p>
              <p>🎵 Try songs from different genres to discover new music you might enjoy!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 