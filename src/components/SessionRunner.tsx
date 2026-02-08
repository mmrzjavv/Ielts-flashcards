'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFlashcardSession } from '@/hooks/useFlashcardSession';
import { Flashcard } from '@/components/Flashcard';
import { Controls } from '@/components/Controls';
import { Dashboard } from '@/components/Dashboard';
import { speak } from '@/utils/tts';
import { Card, StudyMode, InputMode } from '@/types';
import Link from 'next/link';

interface SessionRunnerProps {
    cards: Card[];
    mode: StudyMode; // Default mode passed from parent
    bookName?: string;
    resume?: boolean;
}

export const SessionRunner: React.FC<SessionRunnerProps> = ({ cards, mode: initialMode, bookName, resume = false }) => {
    const { 
        state, 
        timer, 
        startSession, 
        getCurrentCard, 
        handleCorrectAnswer, 
        handleWrongAnswer,
        isInitialized,
        updateStudyMode,
        updateInputMode
    } = useFlashcardSession();
    
    // UI State
    const [isFlipped, setIsFlipped] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect', message: string } | null>(null);

    // Setup State (Local to this component before starting session)
    const [setupMode, setSetupMode] = useState<StudyMode>(initialMode);
    const [setupInputMode, setSetupInputMode] = useState<InputMode>('flashcard');
    const [isSetupComplete, setIsSetupComplete] = useState(resume);

    // Resume Logic
    useEffect(() => {
        if (!isInitialized) return;

        if (resume) {
            if (state.cards.length > 0) {
                setSessionStarted(true);
                setIsSetupComplete(true);
            }
        }
    }, [resume, isInitialized, state.cards.length]);

    // Current Card
    const currentCard = getCurrentCard();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Dynamic Study Mode Change
    const changeStudyMode = (newMode: StudyMode) => {
        updateStudyMode(newMode);
    };

    const changeInputMode = (newMode: InputMode) => {
        updateInputMode(newMode);
    };

    // Determine Effective Study Mode (for Mix mode)
    const effectiveStudyMode = useMemo(() => {
        if (!currentCard) return 'en-fa';
        if (state.studyMode === 'mix') {
            // Simple deterministic random based on word length + random seed if we had one, 
            // but for true randomness per session card instance, we might want a persistent property.
            // However, useMemo with currentCard dependency is "stable enough" for the duration of viewing this card.
            return Math.random() > 0.5 ? 'en-fa' : 'fa-en';
        }
        return state.studyMode;
    }, [currentCard, state.studyMode]);

    // Reset UI on card change
    useEffect(() => {
        setIsFlipped(false);
        setShowAnswer(false);
        setInputValue('');
        setFeedback(null);
    }, [currentCard]);

    const handleStart = () => {
        startSession(cards, setupMode, setupInputMode, !!bookName, bookName);
        setSessionStarted(true);
        setIsSetupComplete(true);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleShowAnswer = () => {
        setIsFlipped(true);
        setShowAnswer(true);
        if (currentCard) speak(currentCard.word);
    };
    
    const handleTypingSubmit = () => {
        if (!currentCard) return;

        // Determine correct answer based on effective mode
        // If EN-FA: Input should be Meaning
        // If FA-EN: Input should be Word
        // If Mix: Depends on effectiveStudyMode
        
        const expectedAnswer = effectiveStudyMode === 'en-fa' ? currentCard.meaning : currentCard.word;
        
        // Normalize for comparison (trim, lowercase, remove punctuation if needed)
        // Simple normalization:
        const normalize = (s: string) => (s || '').trim().toLowerCase();
        const isCorrect = normalize(inputValue) === normalize(expectedAnswer);
        
        if (isCorrect) {
            setFeedback({ type: 'correct', message: 'Correct!' });
            // Don't auto-advance, show feedback first
            setIsFlipped(true);
            setShowAnswer(true);
            speak(currentCard.word);
        } else {
            setFeedback({ type: 'incorrect', message: `Incorrect. The answer was: ${expectedAnswer}` });
            setIsFlipped(true);
            setShowAnswer(true);
            speak(currentCard.word);
        }
    };

    const onCorrect = () => {
        if (!currentCard) return;
        handleCorrectAnswer();
    };

    const onWrong = () => {
        if (!currentCard) return;
        handleWrongAnswer();
    };
    
    const onOverride = () => {
         // User claims they were right despite typo
         setFeedback({ type: 'correct', message: 'Overridden: Marked as Correct' });
         // We don't advance yet, user must click Next (which calls onCorrect)
    };

    const handleDownloadWrongs = () => {
        if (state.wrongAnswers.length === 0) return;
        const csvContent = "data:text/csv;charset=utf-8," 
            + state.wrongAnswers.map(c => `${c.word},${c.phonetic},${c.meaning}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `wrong_answers_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // SETUP SCREEN
    if (!isSetupComplete && !resume) {
        return (
            <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-[#1e1e1e] rounded-2xl p-8 shadow-2xl border border-gray-800">
                    <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                        Session Setup
                    </h1>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">Study Mode</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['en-fa', 'fa-en', 'mix'] as StudyMode[]).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setSetupMode(m)}
                                        className={`py-3 px-4 rounded-xl border font-medium transition-all ${
                                            setupMode === m 
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                        }`}
                                    >
                                        {m === 'en-fa' ? 'EN → FA' : m === 'fa-en' ? 'FA → EN' : 'Mixed'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-2 font-medium">Input Mode</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setSetupInputMode('flashcard')}
                                    className={`py-3 px-4 rounded-xl border font-medium transition-all ${
                                        setupInputMode === 'flashcard' 
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    🃏 Flashcard
                                </button>
                                <button
                                    onClick={() => setSetupInputMode('typing')}
                                    className={`py-3 px-4 rounded-xl border font-medium transition-all ${
                                        setupInputMode === 'typing' 
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    ⌨️ Typing
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleStart}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform"
                        >
                            Start Session
                        </button>
                        
                         <Link 
                            href="/" 
                            className="block text-center text-gray-500 hover:text-gray-300 text-sm mt-4"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!isInitialized || (!sessionStarted && resume)) {
        return <div className="flex items-center justify-center min-h-screen text-white">Loading session...</div>;
    }

    if (state.isSessionComplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center animate-fade-in bg-[#121212] text-white">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                    Session Complete!
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                    You mastered {state.masteredPile.length} words in {Math.floor(timer / 60)}m {timer % 60}s.
                </p>
                
                <div className="grid gap-4 w-full max-w-md">
                     {state.wrongAnswers.length > 0 && (
                        <button 
                            onClick={handleDownloadWrongs}
                            className="w-full py-4 bg-red-600/20 text-red-400 border border-red-600/50 rounded-xl hover:bg-red-600/30 transition-all font-bold flex items-center justify-center gap-2"
                        >
                            <span>📥</span> Download Weak Words ({state.wrongAnswers.length})
                        </button>
                     )}
                     
                     <Link 
                        href="/" 
                        className="w-full py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all font-bold border border-gray-700"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!currentCard) {
         return <div className="flex items-center justify-center min-h-screen text-white bg-[#121212]">Preparing next card...</div>;
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white flex flex-col md:flex-row">
            {/* Dashboard Sidebar */}
            <Dashboard 
                state={state} 
                timer={timer} 
                bookName={bookName}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 pt-16 md:p-6 relative min-h-[50vh]">
                 {/* Back to Home Button */}
                 <div className="absolute top-4 left-4 z-40">
                    <Link 
                        href="/" 
                        className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700 transition-colors shadow-lg border border-gray-700 text-xl"
                        title="Back to Home"
                    >
                        🏠
                    </Link>
                 </div>

                 {/* Dynamic Mode Switcher */}
                 <div className="absolute top-4 right-4 z-40">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="p-3 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors shadow-lg border border-gray-700"
                        >
                            ⚙️
                        </button>
                        
                        {isSettingsOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-700 p-4 animate-fade-in-down">
                                <h3 className="text-gray-300 font-bold mb-3 border-b border-gray-700 pb-2">Session Settings</h3>
                                
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Study Mode</label>
                                    <div className="flex flex-col gap-2">
                                        {(['en-fa', 'fa-en', 'mix'] as StudyMode[]).map(m => (
                                            <button
                                                key={m}
                                                onClick={() => changeStudyMode(m)}
                                                className={`text-sm py-2 px-3 rounded-lg text-left transition-colors ${
                                                    state.studyMode === m ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50' : 'hover:bg-gray-800 text-gray-400'
                                                }`}
                                            >
                                                {m === 'en-fa' ? '🇬🇧 EN → 🇮🇷 FA' : m === 'fa-en' ? '🇮🇷 FA → 🇬🇧 EN' : '🔀 Mixed'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Input Mode</label>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => changeInputMode('flashcard')}
                                            className={`text-sm py-2 px-3 rounded-lg text-left transition-colors ${
                                                state.inputMode === 'flashcard' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50' : 'hover:bg-gray-800 text-gray-400'
                                            }`}
                                        >
                                            🃏 Flashcard
                                        </button>
                                        <button
                                            onClick={() => changeInputMode('typing')}
                                            className={`text-sm py-2 px-3 rounded-lg text-left transition-colors ${
                                                state.inputMode === 'typing' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50' : 'hover:bg-gray-800 text-gray-400'
                                            }`}
                                        >
                                            ⌨️ Typing
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                 <div className="w-full max-w-2xl perspective-1000 mb-6">
                     <Flashcard 
                        card={currentCard}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                        mode={effectiveStudyMode}
                     />
                 </div>

                 <Controls 
                    inputMode={state.inputMode}
                    onCorrect={onCorrect}
                    onWrong={onWrong}
                    onShowAnswer={handleShowAnswer}
                    onOverride={onOverride}
                    onSpeak={() => speak(currentCard.word)}
                    showAnswer={showAnswer}
                    canOverride={true}
                    
                    // Typing props
                    inputValue={inputValue}
                    onInputChange={setInputValue}
                    onSubmitAnswer={handleTypingSubmit}
                    feedback={feedback}
                 />
                 
                 <div className="mt-8 text-gray-500 text-sm flex items-center gap-2">
                    <span>Phase:</span>
                    <span className={`font-bold uppercase px-2 py-0.5 rounded text-xs ${
                        state.learningPhase === 'assessment' ? 'bg-blue-900 text-blue-300' :
                        state.learningPhase === 'drill' ? 'bg-orange-900 text-orange-300' :
                        'bg-green-900 text-green-300'
                    }`}>
                        {state.learningPhase.replace('_', ' ')}
                    </span>
                 </div>
            </div>
        </div>
    );
};
