'use client';

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Play, 
  Sparkles, 
  TrendingUp, 
  Brain, 
  Search, 
  X, 
  Star, 
  FileText, 
  Video as VideoIcon, 
  Compass, 
  Trees,
  Columns
} from 'lucide-react';
import Link from 'next/link';
import { useLibrary } from '@/context/LibraryContext';

const getCategoryColors = (collection: string) => {
  const normalized = collection.toLowerCase().trim();
  switch (normalized) {
    case 'quran':
      return {
        cardBg: 'bg-emerald-100/40 border-emerald-300/30 dark:bg-card dark:border-border-custom',
        coverBg: 'bg-emerald-200/50 border-emerald-400/30 text-emerald-950 dark:bg-emerald-955/40 dark:border-emerald-500/20 dark:text-emerald-400',
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      };
    case 'trading':
      return {
        cardBg: 'bg-blue-100/40 border-blue-300/30 dark:bg-card dark:border-border-custom',
        coverBg: 'bg-blue-200/50 border-blue-400/30 text-blue-955 dark:bg-blue-955/40 dark:border-blue-500/20 dark:text-blue-400',
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      };
    case 'ai':
      return {
        cardBg: 'bg-purple-100/40 border-purple-300/30 dark:bg-card dark:border-border-custom',
        coverBg: 'bg-purple-200/50 border-purple-400/30 text-purple-955 dark:bg-purple-955/40 dark:border-purple-500/20 dark:text-purple-400',
        badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
      };
    case 'self development':
    case 'self-development':
      return {
        cardBg: 'bg-indigo-100/40 border-indigo-300/30 dark:bg-card dark:border-border-custom',
        coverBg: 'bg-indigo-200/50 border-indigo-400/30 text-indigo-955 dark:bg-indigo-955/40 dark:border-indigo-500/20 dark:text-indigo-400',
        badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
      };
    case 'fateh':
      return {
        cardBg: 'bg-amber-100/40 border-amber-300/30 dark:bg-card dark:border-border-custom',
        coverBg: 'bg-amber-200/50 border-amber-400/30 text-amber-955 dark:bg-amber-955/40 dark:border-amber-500/20 dark:text-amber-400',
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
      };
    default:
      return {
        cardBg: 'bg-stone-100/40 border-stone-300/30 dark:bg-card dark:border-border-custom',
        coverBg: 'bg-stone-200/50 border-stone-400/30 text-stone-955 dark:bg-stone-900 dark:border-stone-700 dark:text-stone-300',
        badge: 'bg-stone-500/10 text-stone-600 dark:text-stone-400'
      };
  }
};

export default function Home() {
  const { collections, books, videos, highlights, dashboards } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLayoutReversed, setIsLayoutReversed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-layout-reversed');
    if (saved === 'true') {
      setIsLayoutReversed(true);
    }
  }, []);

  const continueReadingBooks = books.filter(b => b.status === 'reading').slice(0, 2);

  // Dynamically calculate recently added items from user's library
  const recentlyAddedItems = [
    ...books.map(b => ({ id: b.id, title: b.title, type: 'ebook' as const, date: b.dateAdded || 'Recently' })),
    ...videos.map(v => ({ id: v.id, title: v.title, type: 'video' as const, date: v.dateAdded || 'Recently' }))
  ]
  .sort((a, b) => b.id.localeCompare(a.id))
  .slice(0, 3);

  // Universal Search calculations
  const query = searchQuery.trim().toLowerCase();
  
  const matchingBooks = query 
    ? books.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.author.toLowerCase().includes(query) || 
        b.description.toLowerCase().includes(query) || 
        b.collection.toLowerCase().includes(query)
      ) 
    : [];

  const matchingVideos = query 
    ? videos.filter(v => 
        v.title.toLowerCase().includes(query) || 
        v.author.toLowerCase().includes(query) || 
        v.description.toLowerCase().includes(query) || 
        v.collection.toLowerCase().includes(query)
      ) 
    : [];

  const matchingHighlights = query 
    ? highlights.filter(h => 
        h.text.toLowerCase().includes(query) || 
        h.source.toLowerCase().includes(query) || 
        h.author.toLowerCase().includes(query) || 
        h.collection.toLowerCase().includes(query)
      ) 
    : [];

  const hasResults = matchingBooks.length > 0 || matchingVideos.length > 0 || matchingHighlights.length > 0;

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
      {/* Top Header Row */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-handwritten text-5xl md:text-6xl font-bold tracking-tight text-header-custom leading-tight">
            Let's make today meaningful
          </h1>
          <div className="flex items-center gap-2.5 text-sm md:text-base text-muted-custom mt-3.5 font-medium italic">
            <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>"Small steps, lasting growth"</span>
          </div>
        </div>

        {/* Streak & Apple-style Circular Reading Goal */}
        <div className="flex items-center gap-3">
          {/* Streak widget */}
          <div className="flex items-center gap-2.5 bg-card border border-border-custom px-4 py-3 rounded-2xl shadow-sm">
            <Flame className="w-5 h-5 text-accent-gold fill-accent-gold/20 animate-pulse shrink-0" />
            <div>
              <p className="text-[9px] text-muted-custom font-bold uppercase tracking-wider leading-none">
                Streak
              </p>
              <p className="text-xs font-bold mt-1 text-foreground">12 Days</p>
            </div>
          </div>

          {/* SVG Circular Goal Widget */}
          <div className="flex items-center gap-3 bg-card border border-border-custom px-4 py-2.5 rounded-2xl shadow-sm">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="stroke-foreground/10 fill-none"
                  strokeWidth="3.5"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="stroke-accent-gold fill-none transition-all duration-500"
                  strokeWidth="3.5"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - 30 / 45)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[8px] font-bold text-foreground">66%</span>
            </div>
            <div>
              <p className="text-[9px] text-muted-custom font-bold uppercase tracking-wider leading-none">
                Reading Goal
              </p>
              <p className="text-xs font-bold mt-1 text-foreground">30 / 45 min</p>
            </div>
          </div>

          {/* Layout Swap Button */}
          <button
            onClick={() => {
              const nextVal = !isLayoutReversed;
              setIsLayoutReversed(nextVal);
              localStorage.setItem('dashboard-layout-reversed', String(nextVal));
            }}
            className="flex items-center gap-1.5 px-4 py-3.5 bg-card border border-border-custom rounded-2xl shadow-sm text-muted-custom hover:text-foreground text-xs font-bold transition-all cursor-pointer hover:border-accent-gold/45"
            title="Swap columns layout (Left/Right)"
          >
            <Columns className="w-4 h-4 text-accent-gold shrink-0" />
            <span className="text-[10px] uppercase font-bold tracking-wider leading-none">Swap Layout</span>
          </button>
        </div>
      </header>



      {/* Motivational Quote/Reminder Card (Malay Version) */}
      <section className="mb-8 p-6 rounded-3xl bg-radial from-accent-gold/10 to-transparent border border-accent-gold/20 relative overflow-hidden shadow-lg shadow-accent-gold/2">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles className="w-24 h-24 text-accent-gold" />
        </div>
        <div className="max-w-2xl relative z-10">
          <p className="font-serif text-base md:text-lg italic leading-relaxed text-foreground/90 mb-3">
            "Barangsiapa yang menempuh satu jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju ke Syurga."
          </p>
          <p className="text-xs font-semibold text-accent-gold tracking-widest uppercase">
            — Sahih Muslim
          </p>
        </div>
      </section>

      {/* Global AI & Library Search Bar */}
      <div className="relative mb-8 shadow-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-custom" />
        <input
          type="text"
          placeholder='Ask or search: "show me everything about surah albaqarah" or "trading"...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-card border border-border-custom rounded-2xl text-sm focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-all text-foreground font-medium"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-foreground/5 text-muted-custom hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Conditional Universal Search View */}
      {searchQuery ? (
        <div className="flex flex-col gap-8 animate-fade-in">
          <div className="flex items-center justify-between border-b border-border-custom pb-3">
            <h2 className="font-serif text-2xl font-bold">
              Universal Search Results
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-custom bg-foreground/5 px-3 py-1 rounded-full">
              Found {matchingBooks.length + matchingVideos.length + matchingHighlights.length} items
            </span>
          </div>

          {!hasResults ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-custom rounded-3xl p-6">
              <Brain className="w-12 h-12 text-muted-custom mb-3 opacity-50" />
              <h3 className="font-serif text-lg font-bold">No matches found</h3>
              <p className="text-xs text-muted-custom max-w-sm mt-1">
                We couldn't find matches for <code className="px-1 py-0.5 bg-foreground/5 rounded text-foreground font-mono">{searchQuery}</code>. Try searching for "albaqarah", "trading", "Nouman", or "Habits"!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              
              {/* Ebooks Results */}
              {matchingBooks.length > 0 && (
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent-gold" /> Ebooks ({matchingBooks.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchingBooks.map((book) => {
                      const colors = getCategoryColors(book.collection);
                      return (
                        <Link 
                          href={`/ebooks?search=${book.title}`} 
                          key={book.id}
                          className="bg-card border border-border-custom hover:border-accent-gold/30 rounded-2xl p-4 flex gap-4 transition-all"
                        >
                          <div className={`w-14 h-20 book-cover-3d flex flex-col justify-between p-1.5 border font-serif text-[9px] select-none ${colors.coverBg} shrink-0`}>
                            <span className="font-bold leading-tight line-clamp-3">{book.title}</span>
                            <span className="text-[7px] opacity-75">{book.author}</span>
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                            <div>
                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                                {book.collection}
                              </span>
                              <h4 className="font-serif font-bold text-sm text-foreground mt-1.5 truncate">
                                {book.title}
                              </h4>
                              <p className="text-xs text-muted-custom truncate">
                                by {book.author}
                              </p>
                            </div>
                            <span className="text-[10px] text-muted-custom font-semibold">
                              {book.status === 'not_started' ? 'Unread' : `${book.progress}% read`}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Videos Results */}
              {matchingVideos.length > 0 && (
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <VideoIcon className="w-5 h-5 text-emerald-500" /> Videos ({matchingVideos.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchingVideos.map((vid) => (
                      <Link 
                        href={`/videos?search=${vid.title}`} 
                        key={vid.id}
                        className="bg-card border border-border-custom hover:border-accent-gold/30 rounded-2xl p-4 flex gap-4 transition-all"
                      >
                        <div className={`w-24 h-16 rounded-xl border flex items-center justify-center text-xs relative overflow-hidden ${vid.thumbnailColor} shrink-0`}>
                          <Play className="w-6 h-6 text-accent-gold fill-accent-gold/10" />
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 text-[8px] font-mono text-white font-bold">
                            {vid.duration}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <span className="text-[8px] font-bold text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              {vid.collection}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-foreground mt-1.5 truncate">
                              {vid.title}
                            </h4>
                            <p className="text-xs text-muted-custom truncate">
                              {vid.author}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-custom font-semibold">
                            {vid.status === 'not_started' ? 'Unwatched' : `${vid.progress}% watched`}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights & Notes Results */}
              {matchingHighlights.length > 0 && (
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" /> Highlights & Notes ({matchingHighlights.length})
                  </h3>
                  <div className="flex flex-col gap-4">
                    {matchingHighlights.map((hl) => (
                      <div 
                        key={hl.id}
                        className="bg-card border border-border-custom rounded-2xl p-5 shadow-sm hover:border-accent-gold/20 transition-all"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold text-accent-gold uppercase tracking-wider">
                            {hl.source}
                          </span>
                          <span className="text-[10px] text-muted-custom">
                            by {hl.author}
                          </span>
                        </div>
                        <blockquote className="border-l-2 border-accent-gold/40 pl-4 py-1 italic text-xs text-foreground/90 leading-relaxed">
                          "{hl.text}"
                        </blockquote>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      ) : (
        /* Normal Dashboard View */
        <div className="flex flex-col gap-8">

          {/* Main Grid: Continue Reading & Sidebar Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Books progress */}
            <div className={`lg:col-span-2 flex flex-col gap-8 ${isLayoutReversed ? 'lg:order-2' : ''}`}>
              
              {/* Continue Reading Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl font-bold tracking-tight">
                    Continue Reading
                  </h2>
                  <Link href="/ebooks" className="text-xs text-accent-gold font-semibold flex items-center gap-1 hover:underline">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {continueReadingBooks.length === 0 ? (
                    <div className="col-span-1 sm:col-span-2 border border-dashed border-border-custom rounded-2xl p-6 text-center text-xs text-muted-custom animate-fade-in">
                      No books currently in progress. Go to the Library to start reading!
                    </div>
                  ) : (
                    continueReadingBooks.map((book) => {
                      const colors = getCategoryColors(book.collection);
                      return (
                        <div key={book.id} className={`border rounded-2xl p-4 flex gap-4 shadow-sm hover:border-accent-gold/30 hover:shadow-md transition-all duration-300 ${colors.cardBg}`}>
                          {/* Skeuomorphic 3D Cover */}
                          <div className={`w-16 h-24 book-cover-3d flex flex-col justify-between p-2 border font-serif text-[10px] select-none shrink-0 ${colors.coverBg}`}>
                            <span className="font-bold leading-tight line-clamp-3">{book.title}</span>
                            <span className="text-[8px] opacity-75">{book.author}</span>
                          </div>

                          {/* Progress Details */}
                          <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                            <div>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                                {book.collection}
                              </span>
                              <h3 className="font-serif font-bold text-sm text-foreground mt-2 line-clamp-1">
                                {book.title}
                              </h3>
                              <p className="text-xs text-muted-custom truncate">
                                by {book.author}
                              </p>
                            </div>

                            <div className="w-full">
                              <div className="flex justify-between text-[10px] text-muted-custom mb-1">
                                <span>{book.currentPage} / {book.totalPages} pages</span>
                                <span>{book.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-accent-gold rounded-full transition-all duration-500" 
                                  style={{ width: `${book.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Recently Added List */}
              <section className="bg-card border border-border-custom rounded-3xl p-6 shadow-sm">
                <h2 className="font-serif text-lg font-bold tracking-tight mb-4">
                  Recently Added
                </h2>
                <div className="flex flex-col gap-3">
                  {recentlyAddedItems.length === 0 ? (
                    <div className="text-xs text-muted-custom py-6 text-center border border-dashed border-border-custom rounded-2xl">
                      No recent activities. Add your first ebook to begin!
                    </div>
                  ) : (
                    recentlyAddedItems.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold shrink-0">
                          {item.type === 'ebook' ? (
                            <BookOpen className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{item.title}</p>
                          <span className="text-[10px] text-muted-custom">{item.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

            </div>

            {/* Right 1 Column: Widget shortcuts */}
            <div className={`flex flex-col gap-8 ${isLayoutReversed ? 'lg:order-1' : ''}`}>
              
              {/* Dashboards Shortcuts Portal */}
              <section className="bg-rose-100/40 border border-rose-300/30 dark:bg-card dark:border-border-custom rounded-3xl p-6 shadow-sm">
                <h2 className="font-serif text-lg font-bold tracking-tight mb-4">
                  Dashboard Widgets
                </h2>
                <div className="flex flex-col gap-3">
                  {dashboards.slice(0, 3).map((portal) => {
                    const PortIcon = portal.iconType === 'trading' 
                      ? TrendingUp 
                      : portal.iconType === 'quran' 
                      ? BookOpen 
                      : portal.iconType === 'ai' 
                      ? Brain 
                      : Compass;
                    
                    const badgeColor = portal.iconType === 'trading' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : portal.iconType === 'quran' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : portal.iconType === 'ai' 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'bg-amber-500/20 text-amber-400';

                    return (
                      <Link 
                        href={`/dashboards?portal=${portal.id}`}
                        key={portal.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <PortIcon className="w-5 h-5 text-foreground/80" />
                          <span className="text-sm font-semibold">{portal.name}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${badgeColor}`}>
                          {portal.status}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
