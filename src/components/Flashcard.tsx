import React from 'react';
import { Card, StudyMode } from '@/types';

interface FlashcardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  mode: StudyMode;
}

export const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip, mode }) => {
  // Determine content based on mode
  // If mix, we assume the caller has determined the effective mode, but here we only receive 'en-fa' | 'fa-en' | 'mix'
  // Ideally, SessionRunner should resolve 'mix' to a specific effective mode for this card.
  // But if we handle it here, we need consistent state. 
  // BETTER: Pass 'effectiveMode' prop. But for now, let's assume 'mix' defaults to en-fa or handle it in SessionRunner.
  
  // Actually, V1 logic says mix is random per card.
  // Let's rely on the passed mode being the *effective* mode for this render.
  
  const isEnFa = mode === 'en-fa';

  const frontContent = (
      <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-2 break-words max-w-full px-4">
              {isEnFa ? card.word : card.meaning}
          </h2>
          {isEnFa && card.phonetic && (
              <p className="text-lg md:text-xl lg:text-2xl text-gray-500 dark:text-gray-400 font-mono">{card.phonetic}</p>
          )}
      </div>
  );

  const backContent = (
      <div className="text-center w-full">
          {/* Answer is the opposite */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-4 break-words max-w-full px-4">
              {isEnFa ? card.meaning : card.word}
          </h2>
          
          {/* Additional context */}
          {!isEnFa && card.phonetic && (
               <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-mono mb-2">{card.phonetic}</p>
          )}
          
          {/* Always show the prompt word again for reference */}
          <p className="text-sm md:text-base text-gray-400 mt-4 border-t border-gray-700 pt-2 mx-auto max-w-[80%]">
              {isEnFa ? card.word : card.meaning}
          </p>
      </div>
  );
  
  return (
    <div 
      className="perspective-1000 w-full max-w-lg md:max-w-2xl lg:max-w-3xl h-80 md:h-96 cursor-pointer mx-auto"
      onClick={onFlip}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl flex items-center justify-center p-8 border border-gray-200 dark:border-gray-800">
           {frontContent}
        </div>
        
        {/* Back */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 border border-gray-200 dark:border-gray-800 rotate-y-180">
           {backContent}
        </div>
      </div>
    </div>
  );
};
