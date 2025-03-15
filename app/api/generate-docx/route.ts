import { NextRequest, NextResponse } from 'next/server';
import * as docx from 'docx';
import { Buffer } from 'buffer';

const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Table, TableRow, TableCell, BorderStyle } = docx;

export async function POST(req: NextRequest) {
  try {
    const { content, title, type } = await req.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Parse the essay content
    const sections = parseEssayContent(content);
    
    // Create the Word document
    const doc = createWordDocument(title, type, sections);
    
    // Generate the document as a buffer
    const buffer = await (doc as any).save();
    
    // Return the document as a downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_essay.docx"`,
      },
    });
  } catch (error) {
    console.error('Error generating Word document:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}

function parseEssayContent(content: string) {
  // Split the content into sections
  const lines = content.split('\n');
  const sections: { type: string; content: string; level?: number }[] = [];
  
  let currentSection = '';
  let currentType = 'paragraph';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if this is a heading
    if (/^#{1,6}\s+/.test(trimmedLine)) {
      // Save the previous section if it exists
      if (currentSection) {
        sections.push({ type: currentType, content: currentSection.trim() });
      }
      
      // Extract heading level and text
      const match = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2];
        sections.push({ type: 'heading', content: headingText, level });
      }
      
      currentSection = '';
      currentType = 'paragraph';
    } 
    // Check if this is a title page marker
    else if (trimmedLine.toLowerCase().includes('title:') || trimmedLine.toLowerCase().includes('title page')) {
      if (currentSection) {
        sections.push({ type: currentType, content: currentSection.trim() });
      }
      sections.push({ type: 'titlePage', content: '' });
      currentSection = '';
      currentType = 'paragraph';
    }
    // Check if this is a references section
    else if (trimmedLine.toLowerCase() === 'references' || trimmedLine.toLowerCase() === 'bibliography') {
      if (currentSection) {
        sections.push({ type: currentType, content: currentSection.trim() });
      }
      currentSection = trimmedLine;
      currentType = 'references';
    }
    // Otherwise, add to the current section
    else {
      currentSection += line + '\n';
    }
  }
  
  // Add the last section
  if (currentSection) {
    sections.push({ type: currentType, content: currentSection.trim() });
  }
  
  return sections;
}

function createWordDocument(title: string, type: string, sections: { type: string; content: string; level?: number }[]) {
  // Create a new document
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
          },
          paragraph: {
            spacing: {
              line: 480, // Double spacing (240 = single)
            },
          },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          run: {
            font: 'Times New Roman',
            size: 28, // 14pt
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 240, // 12pt
              after: 120, // 6pt
            },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          run: {
            font: 'Times New Roman',
            size: 26, // 13pt
            bold: true,
          },
          paragraph: {
            spacing: {
              before: 240, // 12pt
              after: 120, // 6pt
            },
          },
        },
        {
          id: 'Title',
          name: 'Title',
          run: {
            font: 'Times New Roman',
            size: 32, // 16pt
            bold: true,
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (72 * 20)
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: generateDocumentChildren(title, type, sections),
      },
    ],
  });
  
  return doc;
}

function generateDocumentChildren(title: string, type: string, sections: { type: string; content: string; level?: number }[]) {
  const children: docx.Paragraph[] = [];
  
  // Add title page
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: '',
      spacing: {
        before: 960, // 48pt
      },
    }),
    new Paragraph({
      text: 'Student Name',
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: new Date().toLocaleDateString(),
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `${type.charAt(0).toUpperCase() + type.slice(1)} Essay`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: 'Course Name',
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: 'Institution Name',
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: '',
     // break: PageBreak.AFTER,
    })
  );
  
  // Process each section
  for (const section of sections) {
    if (section.type === 'titlePage') {
      // Skip, we already added a title page
      continue;
    } else if (section.type === 'heading') {
      children.push(
        new Paragraph({
          text: section.content,
          heading: section.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
        })
      );
    } else if (section.type === 'references') {
      // Add a page break before references
      children.push(
        new Paragraph({
          text: '',
         // break: PageBreak.AFTER,
        }),
        new Paragraph({
          text: 'References',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        })
      );
      
      // Split references into individual entries
      const referenceEntries = section.content
        .replace('References', '')
        .split(/\n/)
        .filter(entry => entry.trim().length > 0);
      
      // Add each reference entry
      for (const entry of referenceEntries) {
        children.push(
          new Paragraph({
            text: entry.trim(),
            alignment: AlignmentType.LEFT,
            indent: {
              hanging: 720, // 0.5 inch hanging indent
              left: 720,    // 0.5 inch left indent
            },
          })
        );
      }
    } else {
      // Regular paragraphs
      const paragraphs = section.content.split(/\n\s*\n/);
      
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
          children.push(
            new Paragraph({
              text: paragraph.trim(),
              alignment: AlignmentType.LEFT,
              indent: {
                firstLine: 720, // 0.5 inch first line indent
              },
            })
          );
        }
      }
    }
  }
  
  return children;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 