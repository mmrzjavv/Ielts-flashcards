import Link from 'next/link';
import { ResumeBanner } from '@/components/ResumeBanner';
import { HomeClient } from '@/components/HomeClient';

export const metadata = {
  title: 'Ieltsflashcards - Intensive Vocabulary Trainer for IELTS & TOEFL',
  description: 'Master IELTS vocabulary with the "No Escape" method. Upload Anki decks, Excel, or CSV files. Designed for Iranian students. آموزش لغات آیلتس و تافل',
  keywords: [
    'IELTS vocabulary', 'IELTS flashcards', 'TOEFL preparation', 'Anki alternative', 
    'English learning app', 'Persian English learning', 'لغات آیلتس', 'فلش کارت آیلتس', 
    'آموزش زبان انگلیسی', 'برنامه آیلتس'
  ],
  openGraph: {
    title: 'Ieltsflashcards - Master Vocabulary Fast',
    description: 'The intensive learning loop for serious learners. Supports Anki, Excel, and CSV imports.',
    siteName: 'Ieltsflashcards',
    locale: 'en_US',
    type: 'website',
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ieltsflashcards",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "An intensive vocabulary trainer for IELTS and TOEFL preparation with Anki and Excel support.",
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student",
      "audienceType": "IELTS Test Takers"
    },
    "inLanguage": ["en", "fa"],
    "featureList": "Spaced Repetition, Anki Import, Excel Import, Progress Tracking"
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-green-500/30 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Navbar / Top Bar */}
      <nav className="w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-black font-bold text-xl">I</div>
              <span className="font-bold text-xl tracking-tight">Ieltsflashcards</span>
          </div>
          <div className="text-sm text-gray-500 font-mono">v2.0.0</div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          {/* Hero Section */}
          <header className="mb-12 sm:mb-20 text-center animate-fade-in-down">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 sm:mb-8 bg-gradient-to-b from-white to-gray-400 text-transparent bg-clip-text">
                Master Your Vocabulary.
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-2">
                The intensive learning loop designed for serious learners. 
                <br className="hidden md:block" />
                Prepare for IELTS & TOEFL with the <span className="text-green-400 font-semibold">No Escape</span> method.
              </p>
          </header>

          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Resume Banner (Client Component) */}
            <ResumeBanner />

            {/* Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up delay-100">
                
                {/* Book Library Card */}
                <Link 
                    href="/books" 
                    className="group relative overflow-hidden bg-[#161616] border border-gray-800 rounded-3xl p-6 sm:p-8 hover:border-gray-600 transition-all duration-300 hover:bg-[#1a1a1a]"
                >
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-4xl sm:text-5xl p-3 sm:p-4 bg-[#252525] rounded-2xl border border-gray-700/50 shadow-inner">📚</span>
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-100 group-hover:text-purple-400 transition-colors">Library</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Access curated collections of vocabulary books. Optimized for IELTS & TOEFL.
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-800 flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
                            <span>Browse Collection</span>
                        </div>
                    </div>
                </Link>

                {/* Upload Card (Client Component) */}
                <HomeClient />
            </div>
          </div>
          
          {/* SEO Content Section (Hidden from main view but visible to crawlers/bottom of page) */}
          <section className="mt-32 border-t border-gray-800 pt-12 text-gray-400 max-w-4xl mx-auto">
             <div className="grid md:grid-cols-2 gap-12">
                 <div>
                     <h2 className="text-2xl font-bold text-gray-200 mb-4">About Ieltsflashcards</h2>
                     <p className="mb-4">
                         Ieltsflashcards is a specialized tool for mastering English vocabulary. Unlike standard flashcard apps, it forces you to review difficult words until they are truly mastered using the &quot;Assessment, Drill, Final Review&quot; cycle.
                     </p>
                     <p>
                         Perfect for students preparing for high-stakes exams like IELTS Academic, IELTS General, and TOEFL iBT.
                     </p>
                 </div>
                 <div className="text-right" dir="rtl">
                     <h2 className="text-2xl font-bold text-gray-200 mb-4">آموزش لغات آیلتس و تافل</h2>
                     <p className="mb-4">
                         بهترین روش برای یادگیری لغات ضروری آیلتس. با استفاده از سیستم تکرار و تمرین هوشمند، لغات را برای همیشه به خاطر بسپارید.
                     </p>
                     <ul className="list-disc list-inside space-y-2 text-gray-500">
                         <li>پشتیبانی از فایل‌های Anki (.apkg)</li>
                         <li>پشتیبانی از فایل‌های اکسل و CSV</li>
                         <li>متد آموزشی &quot;بدون فرار&quot; (No Escape)</li>
                         <li>مناسب برای فارسی زبانان</li>
                     </ul>
                 </div>
             </div>
          </section>

          <footer className="mt-24 text-center border-t border-gray-800/50 pt-8 opacity-0 pointer-events-none h-0 overflow-hidden">
            {/* Legacy footer replaced by global layout footer */}
          </footer>
      </div>
    </main>
  );
}
