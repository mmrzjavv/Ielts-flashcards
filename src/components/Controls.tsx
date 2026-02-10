import React, { useEffect, useRef } from 'react';
import { InputMode } from '@/types';

interface ControlsProps {
  inputMode: InputMode;
  showAnswer: boolean;
  onShowAnswer: () => void;
  onCorrect: () => void;
  onWrong: () => void;
  onOverride?: () => void;
  onSpeak: () => void;
  canOverride?: boolean;
  
  // Typing props
  inputValue: string;
  onInputChange: (val: string) => void;
  onSubmitAnswer: () => void;
  feedback?: { type: 'correct' | 'incorrect', message: string } | null;

  onPrevious?: () => void;
  canUndo?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
    inputMode,
    showAnswer, 
    onShowAnswer, 
    onCorrect, 
    onWrong, 
    onOverride,
    onSpeak,
    // canOverride, // Unused
    inputValue,
    onInputChange,
    onSubmitAnswer,
    feedback,
    onPrevious,
    canUndo
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount/reset if typing mode
    useEffect(() => {
        if (inputMode === 'typing' && !showAnswer && inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputMode, showAnswer]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (inputMode === 'typing') {
                if (e.key === 'Enter' && !showAnswer) {
                    onSubmitAnswer();
                } else if (showAnswer && e.key === 'Enter') {
                    // Maybe advance? For now, let user click or press space if we add that
                }
            } else {
                // Flashcard mode
                if (e.code === 'Space') {
                    if (document.activeElement?.tagName === 'INPUT') return;
                    e.preventDefault();
                    if (!showAnswer) {
                        onShowAnswer();
                    } else {
                        onSpeak(); 
                    }
                } else if (showAnswer) {
                    if (e.code === 'ArrowLeft' || e.key === '1') {
                        onWrong();
                    } else if (e.code === 'ArrowRight' || e.key === '2') {
                        onCorrect();
                    }
                }
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputMode, showAnswer, onShowAnswer, onWrong, onCorrect, onSpeak, onSubmitAnswer]);

    if (inputMode === 'typing') {
        if (!showAnswer) {
            return (
                <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-md">
                     <div className="flex gap-2 w-full">
                        {/* Previous Button for Typing Mode (Question) */}
                        {onPrevious && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onPrevious(); }}
                                disabled={!canUndo}
                                className={`px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                                    canUndo 
                                    ? 'bg-gray-600 hover:bg-gray-700' 
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                }`}
                                title="Previous Card"
                            >
                                &larr;
                            </button>
                        )}
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                            placeholder="Type your answer..."
                            className="flex-1 px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
                        />
                        <button 
                            onClick={onSubmitAnswer}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                     <button 
                        onClick={onSpeak}
                        className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-2"
                    >
                        🔊 Pronounce Word
                    </button>
                </div>
            );
        } else {
            // Typing mode - Result shown
            return (
                <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-md">
                    <div className={`w-full p-4 rounded-lg text-center font-bold text-lg ${feedback?.type === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {feedback?.message}
                    </div>
                    
                    <div className="flex gap-4">
                        {onPrevious && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); onPrevious(); }}
                                disabled={!canUndo}
                                className={`px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                                    canUndo 
                                    ? 'bg-gray-600 hover:bg-gray-700' 
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                }`}
                                title="Previous Card"
                             >
                                &larr;
                             </button>
                        )}
                        {feedback?.type === 'incorrect' && (
                             <button 
                                onClick={onOverride}
                                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
                             >
                                Override (I was right)
                             </button>
                        )}
                        <button 
                            onClick={feedback?.type === 'correct' ? onCorrect : onWrong} // Advance logic
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors"
                        >
                            Next Card &rarr;
                        </button>
                    </div>
                </div>
            );
        }
    }

    // Flashcard Mode
    if (!showAnswer) {
        return (
            <div className="flex gap-4 mt-8">
                {onPrevious && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onPrevious(); }}
                        disabled={!canUndo}
                        className={`px-6 py-3 text-white rounded-lg font-medium transition-colors ${
                            canUndo 
                            ? 'bg-gray-600 hover:bg-gray-700' 
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                        }`}
                        title="Previous Card"
                    >
                        &larr; Prev
                    </button>
                )}
                <button 
                    onClick={(e) => { e.stopPropagation(); onSpeak(); }}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                    🔊 Speak
                </button>
                <button 
                    onClick={onShowAnswer}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors"
                >
                    Show Answer (Space)
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 mt-8">
            <div className="flex gap-6 items-center">
                {onPrevious && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); onPrevious(); }}
                        disabled={!canUndo}
                        className={`px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                            canUndo 
                            ? 'bg-gray-600 hover:bg-gray-700' 
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                        }`}
                        title="Previous Card"
                     >
                        &larr;
                     </button>
                )}
                <button 
                    onClick={onWrong}
                    className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold shadow-md transition-colors w-32"
                >
                    Wrong
                </button>
                <button 
                    onClick={onCorrect}
                    className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold shadow-md transition-colors w-32"
                >
                    Correct
                </button>
            </div>
             <button 
                onClick={onSpeak}
                className="mt-2 px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
            >
                🔊 Speak Again
            </button>
        </div>
    );
};
