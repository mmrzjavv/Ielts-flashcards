'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface SessionGridProps {
  bookName: string;
  sessions: (string | number)[];
}

export const SessionGrid: React.FC<SessionGridProps> = ({ bookName, sessions }) => {
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('completed_sessions');
        if (stored) {
          try {
            setCompletedSessions(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to parse completed sessions", e);
          }
        }
    }
  }, []);

  return (
    <div className="grid grid-cols-5 gap-2">
      {sessions.map((session) => {
        const sessionKey = `${bookName}:${session}`;
        const isCompleted = completedSessions.includes(sessionKey);
        
        return (
            <Link 
              key={session}
              href={`/session?book=${bookName}&session=${session}`}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-bold transition-all border relative
                ${isCompleted 
                    ? 'bg-green-900/30 text-green-400 border-green-700 hover:bg-green-800/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                    : 'bg-[#2a2a2a] text-gray-300 border-gray-700 hover:bg-green-600 hover:text-white hover:border-green-500'
                }`}
            >
              <span>{session}</span>
              {isCompleted && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs border border-black shadow-sm">
                    ✓
                  </div>
              )}
            </Link>
        );
      })}
    </div>
  );
};
