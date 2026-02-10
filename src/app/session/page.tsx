'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SessionRunner } from '@/components/SessionRunner';
import { useState, useEffect } from 'react';
import { Card, BooksManifest } from '@/types';
import { parseCSV } from '@/utils/csvParser';
import { parseAnkiFile } from '@/utils/ankiParser';

function SessionContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const bookParam = searchParams.get('book');
  const sessionParam = searchParams.get('session');
  
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isResumeMode = modeParam === 'resume';

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isResumeMode) {
            // Logic handled by SessionRunner + useFlashcardSession
            setLoading(false);
            return;
        }

        if (modeParam === 'upload') {
             const stored = sessionStorage.getItem('uploadedCards');
             if (stored) {
                 setCards(JSON.parse(stored));
             } else {
                 throw new Error('No uploaded data found');
             }
        } else if (bookParam && sessionParam) {
          // Check if it's an apkg book by fetching manifest
          let isApkg = false;
          let apkgFileName = '';
          
          try {
             const manifestRes = await fetch('/books/books-manifest.json');
             if (manifestRes.ok) {
                 const manifest: BooksManifest = await manifestRes.json();
                 const bookDef = manifest.books.find(b => b.name === bookParam);
                 if (bookDef && bookDef.format === 'apkg' && bookDef.fileName) {
                     isApkg = true;
                     apkgFileName = bookDef.fileName;
                 }
             }
          } catch (e) {
             console.warn("Failed to check manifest", e);
          }

          if (isApkg) {
              console.log(`Loading .apkg book: ${apkgFileName}`);
              const res = await fetch(`/books/${apkgFileName}`);
              if (!res.ok) throw new Error(`Failed to load book file: ${apkgFileName}`);
              const blob = await res.blob();
              const parsedCards = await parseAnkiFile(blob);
              if (parsedCards.length === 0) throw new Error("No valid cards found in this book.");
              setCards(parsedCards);
          } else {
              // Legacy JSON fetch
              const res = await fetch(`/books/${bookParam}/${sessionParam}.json`);
              if (!res.ok) throw new Error(`Failed to load session ${sessionParam} for book ${bookParam}`);
              const jsonCards = await res.json();
              
              // Map JSON structure to Card interface
              // JSON has 'persian' field instead of 'meaning'
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const mappedCards: Card[] = jsonCards.map((c: any) => ({
                  word: c.word,
                  phonetic: c.phonetic || '', 
                  meaning: c.meaning || c.persian || '', // Fallback to persian if meaning is missing
                  synonyms: c.synonyms ? c.synonyms.split(',') : [], // basic split if string
                  examples: {
                      english: c.definition || '',
                      persian: ''
                  }
              }));
              
              setCards(mappedCards);
          }
        } else if (modeParam === 'quick') {
           // Legacy/Fallback
           const res = await fetch('/sample_vocab.csv');
           if (!res.ok) throw new Error('Failed to load sample data');
           const text = await res.text();
           setCards(parseCSV(text));
        } else {
            setError('Invalid session parameters');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load cards. Please try again.');
      } finally {
        if (!isResumeMode) {
            setLoading(false);
        }
      }
    };

    fetchCards();
  }, [modeParam, bookParam, sessionParam, isResumeMode]);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-white">Loading session...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  
  // If not resuming and no cards, show error
  if (!isResumeMode && cards.length === 0) {
      return <div className="flex items-center justify-center min-h-screen text-white">No cards found.</div>;
  }

  return (
    <SessionRunner 
        cards={cards} 
        mode="en-fa" // Default for now
        bookName={bookParam || undefined}
        sessionName={sessionParam || undefined}
        resume={isResumeMode}
    />
  );
}

export default function SessionPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white">Loading...</div>}>
            <SessionContent />
        </Suspense>
    );
}
