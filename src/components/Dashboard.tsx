import React from 'react';
import { SessionState } from '@/types';

interface DashboardProps {
  state: SessionState;
  timer: number;
  bookName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, timer, bookName }) => {
  const { masteredPile, learningPile, cards, totalAttempts, correctAnswers, learningPhase, unseenCards } = state;
  const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 100;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate remaining
  // const remaining = cards.length - masteredPile.length;

  return (
    <>
      {/* Mobile Dashboard (Compact Top Bar) */}
      <div className="w-full md:hidden bg-[#1e1e1e] border-b border-gray-800 p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
             <h2 className="text-sm font-bold text-white truncate max-w-[60%]">
                 {bookName || state.bookName || 'Session'}
             </h2>
             <div className="text-gray-500 text-xs font-mono bg-gray-800 px-2 py-1 rounded">{formatTime(timer)}</div>
        </div>
        
        <div className="flex items-center gap-3 text-xs">
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-bold">{masteredPile.length}/{cards.length}</span>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className="bg-green-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(masteredPile.length / cards.length) * 100}%` }}
                    />
                </div>
            </div>
            <div className="flex gap-2">
                 <div className="px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-900 rounded" title="Unseen">
                    {unseenCards.length}
                 </div>
                 <div className="px-2 py-1 bg-orange-900/30 text-orange-400 border border-orange-900 rounded" title="Drill">
                    {learningPile.length}
                 </div>
            </div>
        </div>
      </div>

      {/* Desktop Dashboard (Sidebar) */}
      <div className="hidden md:flex w-64 bg-[#1e1e1e] border-r border-gray-800 p-6 flex-col gap-6 h-screen sticky top-0">
        <div className="text-center pb-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white mb-1 break-words">
               {bookName || state.bookName || 'Flashcard Session'}
          </h2>
          <div className="text-gray-500 text-sm font-mono mt-2">{formatTime(timer)}</div>
        </div>

        <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
               <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Progress</div>
               <div className="text-2xl font-bold text-white flex items-end gap-2">
                   {masteredPile.length} <span className="text-sm text-gray-500 mb-1">/ {cards.length}</span>
               </div>
               <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                   <div 
                      className="bg-green-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${(masteredPile.length / cards.length) * 100}%` }}
                   />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Unseen</div>
                    <div className="text-xl font-bold text-blue-400">{unseenCards.length}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Drill</div>
                    <div className="text-xl font-bold text-orange-400">{learningPile.length}</div>
                </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
               <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Accuracy</div>
               <div className={`text-2xl font-bold ${accuracy >= 80 ? 'text-green-400' : 'text-orange-400'}`}>
                   {accuracy}%
               </div>
               <div className="text-xs text-gray-500 mt-1">
                   {correctAnswers} correct / {totalAttempts} attempts
               </div>
            </div>
        </div>
        
        <div className="mt-auto pt-6 border-t border-gray-800">
           <div className="text-xs text-gray-500 mb-2 uppercase">Current Phase</div>
           <div className={`text-sm font-bold uppercase py-2 px-3 rounded text-center ${
              learningPhase === 'assessment' ? 'bg-blue-900/30 text-blue-400 border border-blue-900' :
              learningPhase === 'drill' ? 'bg-orange-900/30 text-orange-400 border border-orange-900' :
              'bg-green-900/30 text-green-400 border border-green-900'
           }`}>
               {learningPhase.replace('_', ' ')}
           </div>
        </div>
      </div>
    </>
  );
};
