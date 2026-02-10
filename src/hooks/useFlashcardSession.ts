import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, SessionState, StudyMode, InputMode } from '@/types';

const INITIAL_STATE: SessionState = {
  cards: [],
  currentIndex: 0,
  learningPhase: 'assessment',
  unseenCards: [],
  learningPile: [],
  masteredPile: [],
  correctAnswers: 0,
  totalAttempts: 0,
  wrongAnswers: [],
  startTime: Date.now(),
  isSessionComplete: false,
  studyMode: 'en-fa',
  inputMode: 'typing'
};

const CORRECT_STREAK_TARGET = 2;
const STORAGE_KEY = 'flashcard_v2_session';

export const useFlashcardSession = () => {
  const [state, setState] = useState<SessionState>(INITIAL_STATE);
  const [history, setHistory] = useState<SessionState[]>([]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.cards && Array.isArray(parsed.cards)) {
                    setState(parsed);
                }
            } catch (e) {
                console.error("Failed to load session", e);
            }
        }
        setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (isInitialized && state.cards.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isInitialized]);

  // Timer logic
  useEffect(() => {
    if (state.cards.length > 0 && !state.isSessionComplete) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.cards.length, state.isSessionComplete]);

  // Track completion
  useEffect(() => {
    if (state.isSessionComplete && state.bookName && state.sessionName) {
        const key = 'completed_sessions';
        const sessionKey = `${state.bookName}:${state.sessionName}`;
        try {
            const stored = localStorage.getItem(key);
            const completed: string[] = stored ? JSON.parse(stored) : [];
            if (!completed.includes(sessionKey)) {
                completed.push(sessionKey);
                localStorage.setItem(key, JSON.stringify(completed));
            }
        } catch (e) {
            console.error("Failed to save completion status", e);
        }
    }
  }, [state.isSessionComplete, state.bookName, state.sessionName]);

  const startSession = useCallback((cards: Card[], studyMode: StudyMode, inputMode: InputMode, isBook: boolean, bookName?: string, sessionName?: string) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }

    // Shuffle cards
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    
    // Initialize cards with streak
    const cardsWithStreak = shuffled.map(c => ({ ...c, correctStreak: 0 }));

    const newState: SessionState = {
      ...INITIAL_STATE,
      cards: cardsWithStreak,
      unseenCards: [...cardsWithStreak],
      startTime: Date.now(),
      studyMode,
      inputMode,
      bookName: bookName,
      sessionName: sessionName
    };
    
    setState(newState);
    setHistory([]);
    setTimer(0);
  }, []);

  const clearSession = useCallback(() => {
      setState(INITIAL_STATE);
      setTimer(0);
      if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
      }
  }, []);

  const getCurrentCard = useCallback((): Card | null => {
    if (state.isSessionComplete) return null;

    if (state.learningPhase === 'assessment') {
        return state.unseenCards.length > 0 ? state.unseenCards[0] : null;
    } else if (state.learningPhase === 'drill') {
        return state.learningPile.length > 0 ? state.learningPile[0] : null;
    } else if (state.learningPhase === 'final_review') {
        return state.currentIndex < state.cards.length ? state.cards[state.currentIndex] : null;
    }
    
    return null;
  }, [state]);

  const handlePrevious = useCallback(() => {
    setHistory(prev => {
        if (prev.length === 0) return prev;
        const previousState = prev[prev.length - 1];
        setState(previousState);
        return prev.slice(0, -1);
    });
  }, []);

  const handleCorrectAnswer = useCallback(() => {
    setHistory(prev => {
        const newHistory = [...prev, state];
        return newHistory.length > 20 ? newHistory.slice(-20) : newHistory;
    });
    setState(prev => {
        const currentCard = getCurrentCard();
        if (!currentCard) return prev;

        const newState = { ...prev };
        newState.correctAnswers += 1;
        newState.totalAttempts += 1;

        if (prev.learningPhase === 'assessment') {
            // Move from unseen to mastered
            newState.unseenCards = prev.unseenCards.slice(1);
            newState.masteredPile = [...prev.masteredPile, currentCard];

            // Check transition
            if (newState.unseenCards.length === 0) {
                if (prev.learningPile.length > 0) {
                    newState.learningPhase = 'drill';
                } else {
                    newState.learningPhase = 'final_review';
                    newState.currentIndex = 0;
                }
            }
        } else if (prev.learningPhase === 'drill') {
            // Logic: correct -> streak++, check target
            const updatedCard = { ...currentCard, correctStreak: (currentCard.correctStreak || 0) + 1 };
            
            // Remove from front
            const remainingPile = prev.learningPile.slice(1);
            
            if (updatedCard.correctStreak! >= CORRECT_STREAK_TARGET) {
                // Mastered
                newState.learningPile = remainingPile;
                newState.masteredPile = [...prev.masteredPile, updatedCard];
            } else {
                // Not mastered yet, move to back
                newState.learningPile = [...remainingPile, updatedCard];
            }

            // Check transition
            if (newState.learningPile.length === 0) {
                newState.learningPhase = 'final_review';
                newState.currentIndex = 0;
            }
        } else if (prev.learningPhase === 'final_review') {
            newState.currentIndex += 1;
            if (newState.currentIndex >= prev.cards.length) {
                newState.isSessionComplete = true;
            }
        }

        return newState;
    });
  }, [getCurrentCard, state]);

  const handleWrongAnswer = useCallback(() => {
    setHistory(prev => {
        const newHistory = [...prev, state];
        return newHistory.length > 20 ? newHistory.slice(-20) : newHistory;
    });
    setState(prev => {
        const currentCard = getCurrentCard();
        if (!currentCard) return prev;

        const newState = { ...prev };
        newState.totalAttempts += 1;

        // Add to wrong answers if not already there (for download)
        if (!prev.wrongAnswers.find(w => w.word === currentCard.word)) {
            newState.wrongAnswers = [...prev.wrongAnswers, currentCard];
        }

        if (prev.learningPhase === 'assessment') {
            // Move from unseen to learningPile
            newState.unseenCards = prev.unseenCards.slice(1);
            newState.learningPile = [...prev.learningPile, { ...currentCard, correctStreak: 0 }];

            // Check transition
            if (newState.unseenCards.length === 0) {
                 // Must go to drill since we just added to learningPile
                newState.learningPhase = 'drill';
            }
        } else if (prev.learningPhase === 'drill') {
            // Logic: wrong -> streak=0, move to back
            const updatedCard = { ...currentCard, correctStreak: 0 };
            const remainingPile = prev.learningPile.slice(1);
            newState.learningPile = [...remainingPile, updatedCard];
            
            // No transition possible here as length stays same
        } else if (prev.learningPhase === 'final_review') {
            newState.currentIndex += 1;
            if (newState.currentIndex >= prev.cards.length) {
                newState.isSessionComplete = true;
            }
        }

        return newState;
    });
  }, [getCurrentCard, state]);

  const updateStudyMode = useCallback((mode: StudyMode) => {
      setState(prev => ({ ...prev, studyMode: mode }));
  }, []);

  const updateInputMode = useCallback((mode: InputMode) => {
      setState(prev => ({ ...prev, inputMode: mode }));
  }, []);

  return {
    state,
    timer,
    isInitialized,
    startSession,
    clearSession,
    getCurrentCard,
    handleCorrectAnswer,
    handleWrongAnswer,
    handlePrevious,
    canUndo: history.length > 0,
    updateStudyMode,
    updateInputMode
  };
};
