'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFlashcardSession } from '@/hooks/useFlashcardSession';

export const ResumeBanner = () => {
  const { state, isInitialized } = useFlashcardSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasSavedSession = isInitialized && state.cards.length > 0 && !state.isSessionComplete;

  if (!mounted || !hasSavedSession) {
    return null;
  }

  return (
    <div className="group relative p-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-2xl shadow-green-900/20 animate-fade-in-up transition-transform hover:scale-[1.01]">
        <div className="absolute inset-0 bg-white/5 rounded-3xl blur-sm group-hover:blur-md transition-all"></div>
        <div className="relative bg-[#121212] rounded-[22px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Session in Progress</h2>
            </div>
            <p className="text-gray-400 text-lg">
                You have <span className="text-green-400 font-mono font-bold text-xl">{state.unseenCards.length + state.learningPile.length}</span> cards remaining to master.
            </p>
            </div>
            <Link 
            href="/session?mode=resume" 
            className="w-full md:w-auto px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/30 flex items-center justify-center gap-2 group-hover:gap-3"
            >
            Resume Session <span>&rarr;</span>
            </Link>
        </div>
    </div>
  );
};
