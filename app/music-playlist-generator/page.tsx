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
  duration?: string;
  genre?: string[];
  mood?: string[];
}

export default function MusicPlaylistGenerator() {
  const [playlistType, setPlaylistType] = useState('genre');
  const [inputValue, setInputValue] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlaylist = async () => {
    if (!inputValue.trim()) {
      alert('Please enter a value for your playlist!');
      return;
    }

    setIsGenerating(true);
    setSongs([]);
    setPlaylistName('');

    try {
      let promptText = '';
      
      if (playlistType === 'genre') {
        promptText = `Create a music playlist for the genre: "${inputValue}".`;
        setPlaylistName(`${inputValue} Playlist`);
      } else if (playlistType === 'mood') {
        promptText = `Create a music playlist for when someone is feeling: "${inputValue}".`;
        setPlaylistName(`${inputValue} Mood Playlist`);
      } else if (playlistType === 'activity') {
        promptText = `Create a music playlist for someone who is: "${inputValue}".`;
        setPlaylistName(`${inputValue} Activity Playlist`);
      }
      
      promptText += `
      
      Return a list of 10-15 songs that would be perfect for this playlist. For each song, include:
      1. Title
      2. Artist
      3. Album (if relevant)
      4. Year (if relevant)
      5. Duration (if relevant)
      6. Genre tags (2-3 tags)
      7. Mood tags (2-3 tags)
      
      Format your response as a JSON array with the following structure:
      [
        {
          "title": "Song Title",
          "artist": "Artist Name",
          "album": "Album Name",
          "year": "Release Year",
          "duration": "Duration in minutes:seconds",
          "genre": ["genre1", "genre2"],
          "mood": ["mood1", "mood2"]
        },
        ...
      ]
      
      Focus on creating a cohesive playlist with:
      - A good mix of popular and lesser-known tracks
      - Songs that flow well together
      - A variety of artists (unless requesting a single artist playlist)
      - Songs that truly match the requested ${playlistType}
      
      Include both classic and contemporary songs when appropriate.`;
      
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
        throw new Error('Failed to parse playlist from response');
      }
      
      const parsedSongs = JSON.parse(jsonMatch[0]);
      
      // Validate and format the songs
      if (!Array.isArray(parsedSongs) || parsedSongs.length === 0) {
        throw new Error('Invalid playlist format received');
      }
      
      setSongs(parsedSongs);
    } catch (error) {
      console.error('Error generating playlist:', error);
      alert('Sorry, there was an error generating your playlist. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to format duration
  const formatDuration = (duration: string | undefined) => {
    if (!duration) return '';
    
    // If it's already in mm:ss format, return as is
    if (/^\d+:\d+$/.test(duration)) return duration;
    
    // Try to convert to minutes and seconds if it's just a number
    const durationNum = parseFloat(duration);
    if (!isNaN(durationNum)) {
      const minutes = Math.floor(durationNum);
      const seconds = Math.round((durationNum - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return duration;
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
              Music Playlist Generator
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Create the perfect playlist for any genre, mood, or activity
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <label htmlFor="playlistType" className="block text-[#1a4d7c] text-sm font-medium">
                What type of playlist do you want?
              </label>
              <select
                id="playlistType"
                value={playlistType}
                onChange={(e) => setPlaylistType(e.target.value)}
                className={styles.messageInput}
                disabled={isGenerating}
              >
                <option value="genre">Music Genre</option>
                <option value="mood">Current Mood</option>
                <option value="activity">Activity</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="inputValue" className="block text-[#1a4d7c] text-sm font-medium">
                {playlistType === 'genre' 
                  ? 'Enter a music genre' 
                  : playlistType === 'mood' 
                    ? 'How are you feeling?' 
                    : 'What are you doing?'}
              </label>
              <input
                id="inputValue"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  playlistType === 'genre' 
                    ? 'e.g., Jazz, Rock, Hip-Hop, Classical, Electronic...' 
                    : playlistType === 'mood' 
                      ? 'e.g., Happy, Relaxed, Energetic, Melancholic, Focused...' 
                      : 'e.g., Studying, Working Out, Driving, Cooking, Meditating...'
                }
                className={styles.messageInput}
                disabled={isGenerating}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleGeneratePlaylist}
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
                <div className="font-medium text-[#1a4d7c] text-xl mb-2 animate-pulse">Creating your playlist...</div>
                <div className="text-[#2d8a6b]">Curating the perfect songs for your {playlistType}.</div>
              </div>
            )}

            {songs.length > 0 && (
              <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-6">
                <div className="font-medium text-[#1a4d7c] text-xl mb-4">{playlistName}</div>
                
                <div className="space-y-4">
                  {songs.map((song, index) => (
                    <div key={index} className="flex items-start border-b border-[#1a4d7c]/10 pb-3 last:border-0">
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#1a4d7c] text-white rounded-full mr-3">
                        {index + 1}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-[#1a4d7c]">{song.title}</h3>
                          {song.duration && (
                            <div className="text-sm text-[#2d8a6b]">
                              {formatDuration(song.duration)}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-[#2d8a6b] font-medium">
                          {song.artist} {song.album && `• ${song.album}`} {song.year && `(${song.year})`}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {song.genre && song.genre.map((tag, tagIndex) => (
                            <span key={`genre-${tagIndex}`} className="px-2 py-1 rounded-full text-xs font-medium bg-[#1a4d7c]/10 text-[#1a4d7c]">
                              {tag}
                            </span>
                          ))}
                          
                          {song.mood && song.mood.map((tag, tagIndex) => (
                            <span key={`mood-${tagIndex}`} className="px-2 py-1 rounded-full text-xs font-medium bg-[#2d8a6b]/10 text-[#2d8a6b]">
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
              <p>💡 Tip: Be specific with your input for more targeted song recommendations.</p>
              <p>🎵 Try combining terms like "Upbeat Jazz for Studying" in the activity field.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 