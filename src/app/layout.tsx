import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'CelebrationAI – Smart Event Planning Assistant',
  description:
    'Plan your perfect wedding, birthday, corporate event, or community celebration with AI-powered budgets, timelines, vendor checklists, and personalized ideas.',
  keywords: ['event planner', 'wedding planner', 'birthday planner', 'AI assistant', 'budget planner'],
  authors: [{ name: 'CelebrationAI' }],
  openGraph: {
    title: 'CelebrationAI – Smart Event Planning Assistant',
    description: 'Plan your perfect event with AI-powered assistance',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8b5cf6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900 min-h-screen`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
