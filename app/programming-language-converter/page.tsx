'use client';

import { useState } from 'react';
import { Bubbles } from '../components/Bubbles';
import { Navbar } from '../components/Navbar';
import styles from '../styles/bubbles.module.css';

export default function ProgrammingLanguageConverter() {
  const [sourceCode, setSourceCode] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('javascript');
  const [targetLanguage, setTargetLanguage] = useState('python');
  const [convertedCode, setConvertedCode] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [explanation, setExplanation] = useState('');

  const programmingLanguages = [
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'swift', 
    'typescript', 'php', 'rust', 'kotlin', 'scala', 'r', 'dart'
  ];

  const handleConvertCode = async () => {
    if (!sourceCode.trim()) {
      alert('Please enter some code to convert!');
      return;
    }

    setIsConverting(true);
    setConvertedCode('');
    setExplanation('');

    try {
      const prompt = `Convert the following ${sourceLanguage} code to ${targetLanguage}:

${sourceCode}

Provide the converted code in ${targetLanguage} and a brief explanation of the key differences between the two implementations.
Format your response as a JSON object with two properties:
1. "convertedCode": The full converted code as a string
2. "explanation": A brief explanation of the key differences and conversion decisions

Only return the JSON object, nothing else.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.text();
      
      try {
        // Try to parse the result as JSON
        const parsedResult = JSON.parse(result);
        setConvertedCode(parsedResult.convertedCode || '');
        setExplanation(parsedResult.explanation || '');
      } catch (parseError) {
        // If parsing fails, try to extract code using regex
        console.error('Failed to parse JSON response:', parseError);
        
        // Fallback: use the entire response as the converted code
        setConvertedCode(result);
        setExplanation('');
      }
    } catch (error) {
      console.error('Error converting code:', error);
      alert(`Sorry, there was an error converting your code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <Bubbles />
      <Navbar />
      <div className={styles.pageContainer}>
        <h1 className={styles.pageHeading}>Programming Language Converter</h1>
        <p className={styles.pageSubheading}>
          Transform your code between different programming languages with AI-powered conversion
        </p>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className={styles.contentCard}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="sourceLanguage" className="block text-[#1a4d7c] text-sm font-medium">
                  Source Language
                </label>
                <select
                  id="sourceLanguage"
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className={styles.messageInput}
                  disabled={isConverting}
                >
                  {programmingLanguages.map(lang => (
                    <option key={`source-${lang}`} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="targetLanguage" className="block text-[#1a4d7c] text-sm font-medium">
                  Target Language
                </label>
                <select
                  id="targetLanguage"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className={styles.messageInput}
                  disabled={isConverting}
                >
                  {programmingLanguages.map(lang => (
                    <option key={`target-${lang}`} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.contentCard}>
            <label htmlFor="sourceCode" className="block text-[#1a4d7c] text-sm font-medium">
              Source Code
            </label>
            <textarea
              id="sourceCode"
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder={`Enter your ${sourceLanguage} code here...`}
              className={`${styles.messageInput} h-60 font-mono`}
              disabled={isConverting}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleConvertCode}
              className={`${styles.navButton} px-8 ${isConverting ? 'bg-[#1a4d7c]/80 animate-pulse' : ''} ${styles.pulseAnimation}`}
              disabled={isConverting}
            >
              <span className="text-black font-bold">
                {isConverting ? '🔄 Converting...' : '🔄 Convert Code'}
              </span>
            </button>
          </div>
          
          {isConverting && (
            <div className={styles.contentCard}>
              <div className="text-center">
                <div className="font-medium text-[#1a4d7c] text-xl mb-2 animate-pulse">Converting your code...</div>
                <div className="text-[#2d8a6b]">Translating between programming languages.</div>
              </div>
            </div>
          )}

          {convertedCode && (
            <div className={styles.contentCard}>
              <label htmlFor="convertedCode" className="block text-[#1a4d7c] text-sm font-medium">
                Converted Code ({targetLanguage})
              </label>
              <div className="relative">
                <textarea
                  id="convertedCode"
                  value={convertedCode}
                  readOnly
                  className={`${styles.messageInput} h-60 font-mono`}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(convertedCode);
                    alert('Code copied to clipboard!');
                  }}
                  className="absolute top-2 right-2 bg-[#1a4d7c] text-white p-2 rounded-md hover:bg-[#1a4d7c]/80 transition-all"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
          )}

          {explanation && (
            <div className={styles.contentCard}>
              <div className="font-medium text-[#1a4d7c] text-xl mb-2">Explanation</div>
              <div className="text-gray-700 whitespace-pre-wrap">
                {explanation}
              </div>
            </div>
          )}

          <div className={styles.contentCard}>
            <div className="text-sm text-[#2d8a6b] space-y-1">
              <p>💡 <strong>Tip:</strong> For best results, provide complete and syntactically correct code.</p>
              <p>🔍 The converter works best with standard language features rather than framework-specific code.</p>
              <p>📚 The explanation highlights key differences between the languages to help you understand the conversion.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 