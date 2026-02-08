import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ieltsflashcards.ir'),
  title: {
    default: "Ieltsflashcards - IELTS & TOEFL Vocabulary Trainer",
    template: "%s | Ieltsflashcards"
  },
  description: "Master English vocabulary with our intensive learning loop. Designed for Persian speakers preparing for IELTS and TOEFL. آموزش لغات آیلتس",
  keywords: [
    "IELTS", "TOEFL", "Vocabulary", "Flashcards", "Persian", "English Learning", 
    "Spaced Repetition", "Anki", "Excel", "CSV", 
    "لغات آیلتس", "فلش کارت", "آموزش زبان", "آیلتس"
  ],
  authors: [{ name: "Mohammadreza Javaheri" }],
  creator: "Mohammadreza Javaheri",
  publisher: "Ieltsflashcards",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  themeColor: "#0a0a0a",
  openGraph: {
    title: "Ieltsflashcards - Master Vocabulary",
    description: "Intensive vocabulary training with pronunciation and smart revision.",
    url: 'https://ieltsflashcards.ir',
    siteName: 'Ieltsflashcards',
    images: [
      {
        url: '/icon.svg',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ieltsflashcards',
    description: 'Master IELTS Vocabulary with the No Escape method.',
    images: ['/icon.svg'],
  },
  alternates: {
    canonical: 'https://ieltsflashcards.ir',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#0a0a0a] text-white`}
      >
        <div className="flex-1">
            {children}
        </div>
        
        <footer className="py-6 text-center text-xs text-gray-600 border-t border-gray-900 w-full z-10 relative bg-[#0a0a0a]">
            <div className="flex flex-col items-center gap-2">
                <p className="font-medium text-gray-500 tracking-wide uppercase">Developed by Mohammadreza Javaheri</p>
                <div className="flex gap-4 items-center">
                     <a href="mailto:mohammad.r.javaheri@gmail.com" className="hover:text-green-400 transition-colors">Email</a>
                     <span className="text-gray-800">•</span>
                     <a href="https://www.linkedin.com/in/mmrzjavv" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">LinkedIn</a>
                </div>
            </div>
        </footer>
      </body>
    </html>
  );
}
