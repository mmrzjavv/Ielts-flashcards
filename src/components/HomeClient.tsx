'use client';

import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/FileUpload';
import { Card } from '@/types';

export const HomeClient = () => {
    const router = useRouter();

    const handleDataLoaded = (cards: Card[]) => {
        // Save to sessionStorage to pass to session page
        sessionStorage.setItem('uploadedCards', JSON.stringify(cards));
        router.push('/session?mode=upload');
    };

    return (
        <div className="group relative overflow-hidden bg-[#161616] border border-gray-800 rounded-3xl p-6 sm:p-8 hover:border-gray-600 transition-all duration-300">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
                <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📂</span>
                        <h3 className="text-2xl font-bold text-gray-200">Custom Upload</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-700/50">Excel</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/30 px-2 py-1 rounded-md border border-blue-700/50">CSV</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300 bg-pink-900/30 px-2 py-1 rounded-md border border-pink-700/50">Anki</span>
                    </div>
                </div>
                
                <div className="transform transition-all duration-300 group-hover:translate-y-1">
                        <FileUpload onDataLoaded={handleDataLoaded} />
                </div>
                </div>
        </div>
    );
}
