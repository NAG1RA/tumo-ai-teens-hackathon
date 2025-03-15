import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Tools Hub',
  description: 'A collection of AI-powered tools to help with various tasks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-[#f0f9ff] to-[#e6f7ef]`}>
        <div className="min-h-screen pt-16">
          {children}
        </div>
        <footer className="py-4 text-center text-sm text-[#1a4d7c] bg-white/50 backdrop-blur-sm border-t border-[#1a4d7c]/10">
          <p>© {new Date().getFullYear()} AI Tools Hub. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
