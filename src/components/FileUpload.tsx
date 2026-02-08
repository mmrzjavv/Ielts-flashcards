import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { parseAnkiFile } from '@/utils/ankiParser';
import { Card } from '@/types';
import { parseCSV } from '@/utils/csvParser';

interface FileUploadProps {
  onDataLoaded: (cards: Card[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      let cards: Card[] = [];

      if (file.name.endsWith('.apkg') || file.name.endsWith('.colpkg')) {
         cards = await parseAnkiFile(file);
      } else {
         await new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
              try {
                const data = e.target?.result;
                if (file.name.endsWith('.csv')) {
                  if (typeof data === 'string') {
                    cards = parseCSV(data);
                  }
                } else if (file.name.match(/\.xlsx?$/)) {
                  const workbook = XLSX.read(data, { type: 'binary' });
                  const firstSheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[firstSheetName];
                  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                  
                  cards = jsonData.map((row: any) => {
                    if (Array.isArray(row) && row.length >= 3) {
                        return {
                            word: String(row[0] || '').trim(),
                            phonetic: String(row[1] || '').trim(),
                            meaning: String(row[2] || '').trim()
                        };
                    }
                    return null;
                  }).filter((c): c is Card => c !== null && c.word !== '');
                }
                resolve();
              } catch (err) {
                reject(err);
              }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            
            if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsBinaryString(file);
            }
         });
      }

      if (cards.length === 0) {
        throw new Error('No valid cards found in file.');
      }

      onDataLoaded(cards);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
    }
  }, [onDataLoaded]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
        <div 
            className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                ${isDragging ? 'border-green-500 bg-green-50 scale-105' : 'border-gray-300 bg-gray-900/50 hover:border-green-400'}
                ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                id="fileInput" 
                className="hidden" 
                accept=".csv,.xlsx,.xls,.apkg"
                onChange={handleFileChange}
                disabled={isLoading}
            />
            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full bg-green-500/10 text-green-500 transition-transform ${isDragging ? 'scale-110' : ''}`}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold text-gray-200 mb-2">
                        {isLoading ? 'Processing...' : 'Upload File'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                        Drag & drop or click to upload<br/>
                        <span className="text-gray-500 text-xs mt-1 block">Supports .csv, .xlsx, .xls, .apkg (Anki)</span>
                    </p>
                </div>
            </label>

            {/* Format Hint */}
            <div className="mt-6 pt-4 border-t border-gray-800 w-full">
                <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-widest font-semibold text-center">
                    Excel / CSV Column Structure
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-mono bg-black/20 py-2 rounded-lg border border-gray-800/50">
                    <span className="px-1 text-emerald-400/80">A: Word</span>
                    <span className="text-gray-700">|</span>
                    <span className="px-1 text-blue-400/80">B: Phonetic</span>
                    <span className="text-gray-700">|</span>
                    <span className="px-1 text-purple-400/80">C: Meaning</span>
                </div>
            </div>

            {error && (
                <div className="absolute -bottom-16 left-0 w-full p-3 bg-red-100 text-red-700 text-sm rounded-lg animate-fade-in">
                    ⚠️ {error}
                </div>
            )}
        </div>
    </div>
  );
};
