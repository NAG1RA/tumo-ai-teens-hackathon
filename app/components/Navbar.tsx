'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../styles/bubbles.module.css';

interface NavLink {
  href: string;
  label: string;
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('#navbar') && !target.closest('#hamburger-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // List of all navigation links
  const navLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/generate-image', label: 'Generate Image' },
    { href: '/text-to-speech', label: 'Text to Speech' },
    { href: '/speech-to-text', label: 'Speech to Text' },
    { href: '/write-book', label: 'Write Book' },
    { href: '/ai-partner', label: 'AI Study Partner' },
    { href: '/physics-analyzer', label: 'Physics Analyzer' },
    { href: '/flash-card-generator', label: 'Flash Card Generator' },
    { href: '/essay-generator', label: 'Essay Generator' },
    { href: '/book-finder', label: 'Book Finder' },
    { href: '/music-playlist-generator', label: 'Music Playlist Generator' },
    { href: '/song-recommender', label: 'Song Recommender' },
    { href: '/programming-language-converter', label: 'Programming Language Converter' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <h1 className="text-xl font-bold text-[#1a4d7c]">AI Tools Hub</h1>
        </Link>

        {/* Hamburger Button */}
        <button 
          id="hamburger-button"
          className={`${styles.hamburgerButton} ${isOpen ? styles.hamburgerActive : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <nav 
          id="navbar"
          className={`fixed top-0 right-0 h-screen w-64 bg-white/95 backdrop-blur-md shadow-lg transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          } pt-16 px-4 overflow-y-auto`}
        >
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`py-2 px-4 rounded-lg transition-all duration-200 ${
                  pathname === link.href 
                    ? 'bg-gradient-to-r from-[#1a4d7c]/20 to-[#2d8a6b]/20 text-[#1a4d7c] font-bold' 
                    : 'hover:bg-white/50 text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}