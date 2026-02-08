import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { BooksManifest } from '@/types';

async function getBooks(): Promise<BooksManifest> {
  const filePath = path.join(process.cwd(), 'public', 'books', 'books-manifest.json');
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (e) {
      console.error("Could not load books manifest", e);
      return { books: [] };
  }
}

export default async function BooksPage() {
  const manifest = await getBooks();

  return (
    <div className="min-h-screen bg-[#121212] p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-green-400 hover:underline mb-8 inline-block font-medium transition-colors">
            &larr; Back to Home
        </Link>
        
        <header className="mb-12 animate-fade-in-down">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                Book Library
            </h1>
            <p className="text-gray-400">Select a book to start practicing.</p>
        </header>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-up delay-100">
          {manifest.books.map((book) => (
            <div 
                key={book.name} 
                className="bg-[#1e1e1e] rounded-xl shadow-xl p-6 border border-gray-800 hover:border-green-500/50 hover:shadow-2xl transition-all transform hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300" role="img" aria-label="book icon">{book.icon}</span>
                <h2 className="text-xl font-bold text-gray-200 leading-tight group-hover:text-green-400 transition-colors">{book.displayName}</h2>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Sessions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {book.sessions.map((session) => (
                    <Link 
                      key={session}
                      href={`/session?book=${book.name}&session=${session}`}
                      className="aspect-square flex items-center justify-center bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-green-600 hover:text-white text-sm font-bold transition-all border border-gray-700 hover:border-green-500"
                    >
                      {session}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {manifest.books.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 bg-[#1e1e1e] rounded-xl border border-gray-800 border-dashed">
                  No books found in the library.
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
