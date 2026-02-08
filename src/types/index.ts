export type StudyMode = 'en-fa' | 'fa-en' | 'mix';
export type InputMode = 'typing' | 'flashcard';
export type LearningPhase = 'assessment' | 'drill' | 'final_review';

export interface Card {
  word: string;
  phonetic: string;
  meaning: string;
  // Optional metadata
  synonyms?: string[];
  examples?: {
    english: string;
    persian: string;
  };
  // State for session
  correctStreak?: number; // For drill phase (target 2)
}

export interface RetryItem extends Card {
  streak: number; // Legacy, can use Card.correctStreak
}

export interface SessionState {
  cards: Card[];
  currentIndex: number;
  
  // Phase tracking
  learningPhase: LearningPhase;
  unseenCards: Card[];
  learningPile: Card[];      // Cards that need drilling
  masteredPile: Card[];      // Cards fully mastered
  
  // Stats
  correctAnswers: number;
  totalAttempts: number;
  wrongAnswers: Card[];
  
  // Session info
  startTime: number;
  isSessionComplete: boolean;
  
  // Modes
  studyMode: StudyMode;
  inputMode: InputMode;
  
  // Metadata
  bookName?: string;
}

export interface BookSession {
  name: string;
  displayName: string;
  icon: string;
  sessions: (string | number)[];
  format?: 'json' | 'apkg';
  fileName?: string;
}

export interface BooksManifest {
  books: BookSession[];
}
