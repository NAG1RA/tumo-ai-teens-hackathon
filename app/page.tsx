'use client';

/* eslint-disable @next/next/no-img-element */
import { getTextFromDataUrl } from '@ai-sdk/ui-utils';
import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';
import { Bubbles } from './components/Bubbles';
import { Navbar } from './components/Navbar';
import styles from './styles/bubbles.module.css';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat'
  });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Bubbles />
      <Navbar />
      <div className={`${styles.pageContainer} pt-16`}>
        <h1 className={styles.pageHeading}>AI Tools Hub</h1>
        <p className={styles.pageSubheading}>
          Explore our collection of AI-powered tools to help with your tasks
        </p>
        
        <div className={styles.contentCard}>
          <p className="text-center text-[#1a4d7c] mb-4">
            Welcome to AI Tools Hub! Use the menu in the top-right corner to navigate between different AI tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/70 p-4 rounded-lg shadow-sm">
              <h3 className="text-[#1a4d7c] font-bold mb-2">Content Creation</h3>
              <p className="text-sm">Generate essays, books, images, and more with our AI-powered tools.</p>
            </div>
            <div className="bg-white/70 p-4 rounded-lg shadow-sm">
              <h3 className="text-[#1a4d7c] font-bold mb-2">Learning Tools</h3>
              <p className="text-sm">Study with AI partners, create flash cards, and analyze physics concepts.</p>
            </div>
            <div className="bg-white/70 p-4 rounded-lg shadow-sm">
              <h3 className="text-[#1a4d7c] font-bold mb-2">Media & Utilities</h3>
              <p className="text-sm">Convert code, generate music playlists, and articulate poems.</p>
            </div>
          </div>
        </div>

        <div className={styles.chatContainer}>
          <h2 className="text-2xl font-bold text-[#1a4d7c] mb-4 text-center">Chat with AI Assistant</h2>
          
          <div className="flex flex-col gap-2 p-2">
            {messages.map(message => (
              <div key={message.id} className={styles.contentCard}>
                <div className="flex flex-row gap-2">
                  <div className="flex-shrink-0 w-24 text-[#1a4d7c] font-bold">{`${message.role}: `}</div>

                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="text-gray-800">{message.content}</div>

                    <div className="flex flex-row gap-2 mt-2">
                      {message.experimental_attachments?.map((attachment, index) =>
                        attachment.contentType?.includes('image/') ? (
                          <img
                            key={`${message.id}-${index}`}
                            className="w-24 rounded-md shadow-md hover:shadow-lg transition-all"
                            src={attachment.url}
                            alt={attachment.name}
                          />
                        ) : attachment.contentType?.includes('text/') ? (
                          <div className="w-32 h-24 p-2 overflow-hidden text-xs border rounded-md ellipsis text-zinc-500 bg-white/80 shadow-sm hover:shadow-md transition-all">
                            {getTextFromDataUrl(attachment.url)}
                          </div>
                        ) : null,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={event => {
              handleSubmit(event, {
                experimental_attachments: files,
              });
              setFiles(undefined);

              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="fixed bottom-0 flex flex-col w-full gap-2 px-8 pb-4 max-w-[1000px] left-1/2 transform -translate-x-1/2"
          >
            <div className="fixed flex flex-row items-end gap-2 right-2 bottom-24">
              {files
                ? Array.from(files).map(attachment => {
                    const { type } = attachment;

                    if (type.startsWith('image/')) {
                      return (
                        <div key={attachment.name} className="relative group">
                          <img
                            className="w-24 rounded-md shadow-md group-hover:shadow-lg transition-all"
                            src={URL.createObjectURL(attachment)}
                            alt={attachment.name}
                          />
                          <span className="text-sm text-zinc-500 bg-white/80 px-2 py-1 rounded absolute bottom-0 left-0 right-0 text-center opacity-80 group-hover:opacity-100 transition-all">
                            {attachment.name}
                          </span>
                        </div>
                      );
                    } else if (type.startsWith('text/')) {
                      return (
                        <div
                          key={attachment.name}
                          className="flex flex-col flex-shrink-0 w-24 gap-1 text-sm text-zinc-500 group"
                        >
                          <div className="w-16 h-20 rounded-md bg-zinc-100 shadow-sm group-hover:shadow-md transition-all" />
                          <span className="truncate text-center">{attachment.name}</span>
                        </div>
                      );
                    }
                  })
                : ''}
            </div>
            <input
              type="file"
              onChange={event => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              multiple
              ref={fileInputRef}
              className={styles.fileInput}
            />
            <input
              value={input}
              placeholder="Send message..."
              onChange={handleInputChange}
              className={styles.messageInput}
              disabled={status !== 'ready'}
            />
          </form>
        </div>
      </div>
    </>
  );
}
