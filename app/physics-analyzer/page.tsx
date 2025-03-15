'use client';

import { useState, useEffect } from 'react';
import { Bubbles } from '../components/Bubbles';
import styles from '../styles/bubbles.module.css';
import Link from 'next/link';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Common physics equations with their descriptions
const commonEquations: Record<string, string | string[]> = {
  "newton's second law": "F = ma",
  "einstein's mass-energy equivalence": "E = mc^2",
  "gravitational force": "F = G\\frac{m_1m_2}{r^2}",
  "kinetic energy": "E = \\frac{1}{2}mv^2",
  "momentum": "p = mv",
  "wave equation": "v = f\\lambda",
  "doppler effect": "f' = f\\frac{v \\pm v_o}{v \\mp v_s}",
  "special relativity time dilation": "t' = \\frac{t}{\\sqrt{1-\\frac{v^2}{c^2}}}",
  "lorentz factor": "\\gamma = \\frac{1}{\\sqrt{1-\\frac{v^2}{c^2}}}",
  "schrodinger equation": "i\\hbar\\frac{\\partial\\Psi}{\\partial t} = -\\frac{\\hbar^2}{2m} \\nabla^2\\Psi + V\\Psi",
  "heisenberg uncertainty": "\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}",
  "planck's equation": "E = hf",
  "de broglie wavelength": "\\lambda = \\frac{h}{p}",
  "coulomb's law": "F = k\\frac{q_1q_2}{r^2}",
  "ohm's law": "V = IR",
  "power": "P = IV",
  "capacitance": "C = \\frac{Q}{V}",
  "inductance": "V = L\\frac{dI}{dt}",
  "maxwell's equations": ["\\nabla \\cdot E = \\frac{\\rho}{\\varepsilon_0}", "\\nabla \\cdot B = 0", "\\nabla \\times E = -\\frac{\\partial B}{\\partial t}", "\\nabla \\times B = \\mu_0 J + \\mu_0 \\varepsilon_0 \\frac{\\partial E}{\\partial t}"],
  "ideal gas law": "PV = nRT",
  "thermodynamic entropy": "\\Delta S = \\frac{Q}{T}",
  "bernoulli's equation": "P + \\frac{1}{2}\\rho v^2 + \\rho gh = \\text{constant}",
  "conservation of energy": "\\Delta E = Q - W",
  "conservation of momentum": "m_1v_1 + m_2v_2 = m_1v_1' + m_2v_2'",
  "angular momentum": "L = I\\omega",
  "torque": "\\tau = r \\times F",
  "centripetal force": "F = \\frac{mv^2}{r}",
  "universal gravitation": "F = G\\frac{m_1m_2}{r^2}",
  "escape velocity": "v = \\sqrt{\\frac{2GM}{r}}",
  "relativistic energy": "E = \\gamma mc^2",
  "relativistic momentum": "p = \\gamma mv",
  "photoelectric effect": "E = hf - \\phi",
  "black body radiation": "E = \\frac{hf}{e^{\\frac{hf}{kT}} - 1}",
  "stefan-boltzmann law": "P = \\sigma AT^4",
  "wien's displacement law": "\\lambda_{max}T = b",
  "bohr model": "E = -\\frac{13.6\\text{eV}}{n^2}",
  "nuclear binding energy": "E = \\Delta mc^2",
  "radioactive decay": "N = N_0e^{-\\lambda t}",
  "half-life": "t_{1/2} = \\frac{\\ln(2)}{\\lambda}",
  "compton effect": "\\Delta \\lambda = \\frac{h}{mc}(1-\\cos\\theta)",
  "snell's law": "n_1\\sin\\theta_1 = n_2\\sin\\theta_2",
  "lens equation": "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}",
  "magnification": "M = -\\frac{d_i}{d_o}",
  "diffraction": "d\\sin\\theta = m\\lambda",
  "doppler shift": "\\frac{\\Delta f}{f} = \\frac{v}{c}",
  "relativistic doppler effect": "f' = f\\sqrt{\\frac{1-\\frac{v}{c}}{1+\\frac{v}{c}}}"
};

export default function PhysicsAnalyzerPage() {
  const [phenomenon, setPhenomenon] = useState('');
  const [explanation, setExplanation] = useState('');
  const [formattedExplanation, setFormattedExplanation] = useState<React.ReactNode>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Format the explanation to highlight formulas and replace with correct equations
  useEffect(() => {
    if (!explanation) {
      setFormattedExplanation(null);
      return;
    }

    // Process the explanation to format formulas and improve paragraph structure
    const formatExplanation = () => {
      // First, identify and format sections with headings
      const sections: Array<{type: string, header?: string, content: string}> = [];
      let currentText = explanation;
      
      // Common section headers in physics explanations
      const sectionPatterns = [
        /#+\s*(introduction|overview|definition|description)/i,
        /#+\s*(principles|theory|theoretical background|physical principles)/i,
        /#+\s*(equations|formulas|mathematical description|mathematics)/i,
        /#+\s*(applications|examples|real-world applications|practical applications)/i,
        /#+\s*(history|historical context|historical background|development)/i,
        /#+\s*(conclusion|summary)/i
      ];
      
      // Check if the text has markdown-style headers
      const hasHeaders = sectionPatterns.some(pattern => pattern.test(currentText));
      
      if (hasHeaders) {
        // Split by headers (# Header)
        const headerPattern = /#+\s*[A-Za-z0-9\s:]+\n/g;
        let lastIndex = 0;
        let match;
        
        while ((match = headerPattern.exec(currentText)) !== null) {
          // Add text before the header
          if (match.index > lastIndex) {
            const textBefore = currentText.substring(lastIndex, match.index).trim();
            if (textBefore) {
              sections.push({ type: 'paragraph', content: textBefore });
            }
          }
          
          // Get the header text
          const headerText = match[0].replace(/#+\s*/, '').trim();
          
          // Find the end of this section (next header or end of text)
          const nextMatch = headerPattern.exec(currentText);
          headerPattern.lastIndex = match.index + match[0].length; // Reset to continue from after current match
          
          const sectionEnd = nextMatch ? nextMatch.index : currentText.length;
          const sectionContent = currentText.substring(match.index + match[0].length, sectionEnd).trim();
          
          sections.push({ 
            type: 'section', 
            header: headerText, 
            content: sectionContent 
          });
          
          lastIndex = sectionEnd;
        }
        
        // Add any remaining text
        if (lastIndex < currentText.length) {
          const textAfter = currentText.substring(lastIndex).trim();
          if (textAfter) {
            sections.push({ type: 'paragraph', content: textAfter });
          }
        }
      } else {
        // If no headers, try to identify logical sections by content
        const paragraphs = currentText.split(/\n\s*\n/); // Split by empty lines
        
        paragraphs.forEach(paragraph => {
          if (paragraph.trim()) {
            // Check if this paragraph looks like a section start
            if (/^(introduction|definition|principles|equations|applications|history|conclusion):/i.test(paragraph)) {
              const parts = paragraph.split(/:\s*/);
              sections.push({ 
                type: 'section', 
                header: parts[0].trim(), 
                content: parts.slice(1).join(': ').trim() 
              });
            } else {
              sections.push({ type: 'paragraph', content: paragraph.trim() });
            }
          }
        });
      }
      
      // Now process each section or paragraph for formulas
      return sections.map((section, sectionIndex) => {
        if (section.type === 'section') {
          return (
            <div key={`section-${sectionIndex}`} className="mb-6">
              <h3 className="text-xl font-bold text-[#1a4d7c] mb-3 border-b border-[#1a4d7c]/20 pb-2">
                {section.header}
              </h3>
              <div className="space-y-4">
                {processTextWithFormulas(section.content, `section-${sectionIndex}`)}
              </div>
            </div>
          );
        } else {
          return (
            <div key={`para-${sectionIndex}`} className="mb-4">
              {processTextWithFormulas(section.content, `para-${sectionIndex}`)}
            </div>
          );
        }
      });
    };
    
    // Process text to format formulas and split into paragraphs
    const processTextWithFormulas = (text: string, keyPrefix: string) => {
      // Split into paragraphs first
      const paragraphs = text.split(/\n\s*\n/);
      
      return paragraphs.map((paragraph: string, paraIndex: number) => {
        // Skip empty paragraphs
        if (!paragraph.trim()) return null;
        
        // Split by potential formula indicators
        const parts = paragraph.split(/(\$\$.*?\$\$|\$.*?\$)/);
        
        // Check if this paragraph contains block-level formulas or equation sets
        const hasBlockElements = parts.some((part: string) => 
          (part.startsWith('$$') && part.endsWith('$$')) || 
          (new RegExp(Object.keys(commonEquations).filter(key => 
            Array.isArray(commonEquations[key])).join('|'), 'gi').test(part))
        );
        
        // If it has block elements, don't wrap in <p> tag
        if (hasBlockElements) {
          const processedContent: React.ReactNode[] = [];
          
          // Process each part
          parts.forEach((part: string, partIndex: number) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
              // Display block formula - remove the $$ delimiters
              let formula = part.substring(2, part.length - 2).trim();
              
              try {
                // Try to render with KaTeX
                processedContent.push(
                  <div key={`${keyPrefix}-${paraIndex}-formula-${partIndex}`} className="my-4 p-3 bg-[#f0f7ff] border border-[#1a4d7c]/20 rounded-lg text-center overflow-x-auto">
                    <BlockMath math={formula} />
                  </div>
                );
              } catch (error) {
                // Fallback to plain text if KaTeX fails
                formula = replaceWithCommonEquation(formula);
                processedContent.push(
                  <div key={`${keyPrefix}-${paraIndex}-formula-${partIndex}`} className="my-4 p-3 bg-[#f0f7ff] border border-[#1a4d7c]/20 rounded-lg text-center overflow-x-auto">
                    <code className="text-[#1a4d7c] font-mono text-lg">{formula}</code>
                  </div>
                );
              }
            } else if (part.startsWith('$') && part.endsWith('$')) {
              // Display inline formula - remove the $ delimiters
              let formula = part.substring(1, part.length - 1).trim();
              
              // Wrap text content in its own paragraph
              if (part.trim()) {
                try {
                  // Try to render with KaTeX
                  processedContent.push(
                    <p key={`${keyPrefix}-${paraIndex}-text-${partIndex}`} className="mb-3">
                      <span className="mx-1 px-2 py-1 bg-[#f0f7ff] border border-[#1a4d7c]/10 rounded">
                        <InlineMath math={formula} />
                      </span>
                    </p>
                  );
                } catch (error) {
                  // Fallback to plain text if KaTeX fails
                  formula = replaceWithCommonEquation(formula);
                  processedContent.push(
                    <p key={`${keyPrefix}-${paraIndex}-text-${partIndex}`} className="mb-3">
                      <span className="mx-1 px-2 py-1 bg-[#f0f7ff] border border-[#1a4d7c]/10 rounded text-[#1a4d7c] font-mono">
                        {formula}
                      </span>
                    </p>
                  );
                }
              }
            } else {
              // Check for equation names in the text
              const equationNamePattern = new RegExp(Object.keys(commonEquations).join('|'), 'gi');
              if (equationNamePattern.test(part)) {
                const segments: React.ReactNode[] = [];
                let lastIndex = 0;
                let match;
                const regex = new RegExp(Object.keys(commonEquations).join('|'), 'gi');
                
                while ((match = regex.exec(part)) !== null) {
                  // Add text before the match
                  if (match.index > lastIndex) {
                    segments.push(part.substring(lastIndex, match.index));
                  }
                  
                  // Add the equation
                  const equationName = match[0].toLowerCase();
                  const equation = commonEquations[equationName];
                  
                  if (Array.isArray(equation)) {
                    // For equation sets like Maxwell's equations, add text before as a paragraph
                    if (segments.length > 0) {
                      processedContent.push(
                        <p key={`${keyPrefix}-${paraIndex}-text-before-${match.index}`} className="mb-3">
                          {segments}
                        </p>
                      );
                      segments.length = 0; // Clear segments
                    }
                    
                    // Add equation set as a block element
                    processedContent.push(
                      <div key={`${keyPrefix}-${paraIndex}-eq-set-${match.index}`} className="my-3 p-2 bg-[#f0f7ff] border border-[#1a4d7c]/20 rounded-lg">
                        <div className="font-medium text-[#1a4d7c] mb-1">{match[0]}:</div>
                        {equation.map((eq: string, i: number) => (
                          <div key={i} className="text-center my-1">
                            <BlockMath math={eq} />
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    // For inline equations, add to segments
                    try {
                      segments.push(
                        <span key={`${keyPrefix}-${paraIndex}-eq-${match.index}`} className="mx-1 px-2 py-1 bg-[#f0f7ff] border border-[#1a4d7c]/10 rounded">
                          <InlineMath math={equation as string} />
                        </span>
                      );
                    } catch (error) {
                      segments.push(
                        <span key={`${keyPrefix}-${paraIndex}-eq-${match.index}`} className="mx-1 px-2 py-1 bg-[#f0f7ff] border border-[#1a4d7c]/10 rounded text-[#1a4d7c] font-mono">
                          {equation}
                        </span>
                      );
                    }
                  }
                  
                  lastIndex = match.index + match[0].length;
                }
                
                // Add any remaining text
                if (lastIndex < part.length) {
                  segments.push(part.substring(lastIndex));
                }
                
                // Add all segments as a paragraph if not empty
                if (segments.length > 0) {
                  processedContent.push(
                    <p key={`${keyPrefix}-${paraIndex}-text-${partIndex}`} className="mb-3">
                      {segments}
                    </p>
                  );
                }
              } else if (part.trim()) {
                // Regular text - add as paragraph
                processedContent.push(
                  <p key={`${keyPrefix}-${paraIndex}-text-${partIndex}`} className="mb-3">
                    {part}
                  </p>
                );
              }
            }
          });
          
          return <div key={`${keyPrefix}-block-${paraIndex}`} className="mb-4">{processedContent}</div>;
        } else {
          // For paragraphs with only inline elements, process normally
          const processedParts = parts.map((part: string, partIndex: number) => {
            if (part.startsWith('$') && part.endsWith('$')) {
              // Display inline formula - remove the $ delimiters
              let formula = part.substring(1, part.length - 1).trim();
              
              try {
                // Try to render with KaTeX
                return (
                  <span key={`${keyPrefix}-${paraIndex}-inline-${partIndex}`} className="mx-1 px-2 py-1 bg-[#f0f7ff] border border-[#1a4d7c]/10 rounded">
                    <InlineMath math={formula} />
                  </span>
                );
              } catch (error) {
                // Fallback to plain text if KaTeX fails
                formula = replaceWithCommonEquation(formula);
                return (
                  <span key={`${keyPrefix}-${paraIndex}-inline-${partIndex}`} className="mx-1 px-2 py-1 bg-[#f0f7ff] border border-[#1a4d7c]/10 rounded text-[#1a4d7c] font-mono">
                    {formula}
                  </span>
                );
              }
            } else {
              // Check for equation names in the text
              const equationNamePattern = new RegExp(Object.keys(commonEquations).join('|'), 'gi');
              if (equationNamePattern.test(part)) {
                const segments: React.ReactNode[] = [];
                let lastIndex = 0;
                let match;
                const regex = new RegExp(Object.keys(commonEquations).join('|'), 'gi');
                
                while ((match = regex.exec(part)) !== null) {
                  // Add text before the match
                  if (match.index > lastIndex) {
                    segments.push(part.substring(lastIndex, match.index));
                  }
                  
                  // Add the equation (only inline ones for paragraphs)
                  const equationName = match[0].toLowerCase();
                  const equation = commonEquations[equationName];
                  
                  if (!Array.isArray(equation)) {
                    try {
                      segments.push(
                        <span key={`${keyPrefix}-${paraIndex}-eq-${match.index}`} className="mx-1 px-2 py-1 bg-[#f0f7ff] border border-[#1a4d7c]/10 rounded">
                          <InlineMath math={equation as string} />
                        </span>
                      );
                    } catch (error) {
                      segments.push(
                        <span key={`${keyPrefix}-${paraIndex}-eq-${match.index}`} className="mx-1 px-2 py-1 bg-[#f0f7ff] border border-[#1a4d7c]/10 rounded text-[#1a4d7c] font-mono">
                          {equation}
                        </span>
                      );
                    }
                  } else {
                    // Just add the name for array equations (will be handled in block mode)
                    segments.push(match[0]);
                  }
                  
                  lastIndex = match.index + match[0].length;
                }
                
                // Add any remaining text
                if (lastIndex < part.length) {
                  segments.push(part.substring(lastIndex));
                }
                
                return segments;
              }
              
              // Regular text
              return part;
            }
          });
          
          return <p key={`${keyPrefix}-p-${paraIndex}`} className="mb-3">{processedParts}</p>;
        }
      });
    };

    // Function to replace LaTeX formulas with common equations
    const replaceWithCommonEquation = (formula: string): string => {
      // Look for known equation patterns
      for (const [name, equation] of Object.entries(commonEquations)) {
        if (formula.toLowerCase().includes(name)) {
          return Array.isArray(equation) ? equation.join(', ') : equation;
        }
      }
      
      // If no match found, return the original formula
      return formula;
    };

    setFormattedExplanation(formatExplanation());
  }, [explanation]);

  const handleAnalyzePhysics = async () => {
    if (!phenomenon.trim()) {
      alert('Please enter a physics phenomenon to analyze!');
      return;
    }

    setIsAnalyzing(true);
    setExplanation('');
    setFormattedExplanation(null);

    try {
      const promptText = `As a physics expert, provide a comprehensive explanation of the following physics phenomenon:
      "${phenomenon}"
      
      Your explanation should include:
      1. A clear definition and description of the phenomenon
      2. The fundamental physical principles involved
      3. All relevant mathematical equations and formulas
      
      For all equations and formulas:
      - Enclose block equations with $$ on their own lines (e.g., $$E = mc^2$$)
      - Enclose inline equations with single $ (e.g., $F = ma$)
      - Use proper LaTeX notation for all mathematical symbols
      - Keep equations simple and clean, using only necessary symbols
      - Ensure each equation is properly labeled and referenced in the text
      - Mention the name of the equation (e.g., "Newton's Second Law", "Einstein's Mass-Energy Equivalence")
      
      4. Real-world applications and examples
      5. Historical context and key scientists who contributed to our understanding
      
      Format your response with clear sections using markdown headers:
      # Introduction
      # Physical Principles
      # Mathematical Equations
      # Applications
      # Historical Context
      
      Ensure all equations are properly explained and each section is separated by blank lines.
      Use precise scientific language but make it accessible to a university student level.`;
      
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
      
      const explanationText = await response.text();
      console.log('Physics explanation:', explanationText);
      
      setExplanation(explanationText || 'Sorry, I had trouble generating an explanation. Please try again!');
    } catch (error) {
      console.error('Error analyzing physics:', error);
      setExplanation('Sorry, I had trouble analyzing this physics phenomenon. Please try again!');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    setPhenomenon('');
    setExplanation('');
    setFormattedExplanation(null);
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
              Physics Analyzer
            </h2>
            <p className="max-w-[600px] mx-auto text-[#2d8a6b] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Get detailed explanations of physics phenomena with equations and theorems
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <label htmlFor="phenomenon" className="block text-[#1a4d7c] text-sm font-medium">
                Enter a Physics Phenomenon
              </label>
              <input
                id="phenomenon"
                type="text"
                value={phenomenon}
                onChange={(e) => setPhenomenon(e.target.value)}
                placeholder="e.g., Quantum tunneling, Doppler effect, Conservation of angular momentum..."
                className={styles.messageInput}
                disabled={isAnalyzing}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAnalyzePhysics}
                className={`${styles.navButton} flex-1`}
                disabled={isAnalyzing}
              >
                <span className="text-black font-bold">
                  {isAnalyzing ? '🔄 Generating' : '🔄 Generate'}
                </span>
              </button>
            </div>

            {formattedExplanation && (
              <div className="bg-white/80 backdrop-blur border border-[#1a4d7c]/20 rounded-lg p-6">
                <div className="font-medium text-[#1a4d7c] text-xl mb-4">Physics Explanation:</div>
                <div className="prose prose-blue max-w-none">
                  <div className="text-[#2d8a6b]">{formattedExplanation}</div>
                </div>
              </div>
            )}

            <div className="text-sm text-[#2d8a6b] space-y-1">
              <p>💡 Tip: Be specific about the physics phenomenon you want to understand.</p>
              <p>🔬 Examples: "How does quantum entanglement work?", "Explain the photoelectric effect", "Bernoulli's principle"</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 