'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  History, 
  TrendingUp, 
  Award,
  Sparkles,
  XCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';

const getCategoryColors = (collection: string) => {
  const normalized = collection.toLowerCase().trim();
  switch (normalized) {
    case 'quran':
      return {
        rowBg: 'bg-emerald-100/40 border-emerald-300/20 text-emerald-955 dark:bg-card dark:border-border-custom',
        badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
      };
    case 'trading':
      return {
        rowBg: 'bg-blue-100/40 border-blue-300/20 text-blue-955 dark:bg-card dark:border-border-custom',
        badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
      };
    case 'ai':
      return {
        rowBg: 'bg-purple-100/40 border-purple-300/20 text-purple-955 dark:bg-card dark:border-border-custom',
        badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
      };
    case 'self development':
    case 'self-development':
      return {
        rowBg: 'bg-indigo-100/40 border-indigo-300/20 text-indigo-955 dark:bg-card dark:border-border-custom',
        badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
      };
    case 'fateh':
      return {
        rowBg: 'bg-amber-100/40 border-amber-300/20 text-amber-955 dark:bg-card dark:border-border-custom',
        badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
      };
    default:
      return {
        rowBg: 'bg-stone-100/40 border-stone-300/20 text-stone-955 dark:bg-card dark:border-border-custom',
        badge: 'bg-stone-500/15 text-stone-600 dark:text-stone-400'
      };
  }
};

export default function Summary() {
  const { books, videos, highlights } = useLibrary();
  
  const getRealNotesCount = (bookTitle: string, defaultVal: number) => {
    if (!highlights || highlights.length === 0) return defaultVal;
    const count = highlights.filter(h => h.source.toLowerCase().trim() === bookTitle.toLowerCase().trim()).length;
    return count > 0 ? count : defaultVal;
  };

  // Interactive list filters & expansions
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'reading'>('all');
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  // Stats calculation
  const completedBooks = books.filter(b => b.status === 'completed');
  const totalPagesRead = books.reduce((acc, b) => acc + b.currentPage, 0);
  const totalDurationMin = videos.reduce((acc, v) => acc + Math.round(v.currentTime), 0);

  // Real Achievement Badge Checks
  const isFirstBookDone = completedBooks.length >= 1;
  const isTenBooksDone = completedBooks.length >= 10;
  const isFiftyBooksDone = completedBooks.length >= 50;

  // Quran books checks
  const quranBooks = books.filter(b => b.collection.toLowerCase() === 'quran');
  const isAllQuranDone = quranBooks.length > 0 && quranBooks.every(b => b.status === 'completed');
  const quranCompletedCount = quranBooks.filter(b => b.status === 'completed').length;

  // Trading books checks
  const tradingBooks = books.filter(b => b.collection.toLowerCase() === 'trading');
  const isAllTradingDone = tradingBooks.length > 0 && tradingBooks.every(b => b.status === 'completed');
  const tradingCompletedCount = tradingBooks.filter(b => b.status === 'completed').length;

  const BADGES = [
    {
      id: 'first_book',
      emoji: '🥇',
      title: 'First Book Completed',
      desc: 'Finish reading your very first ebook in the library.',
      unlocked: isFirstBookDone,
      progress: isFirstBookDone ? '1/1' : `${completedBooks.length}/1`
    },
    {
      id: 'all_religion',
      emoji: '⭐',
      title: 'Quran Study Accomplished',
      desc: 'Finish every ebook in the Quran & Religion category.',
      unlocked: isAllQuranDone,
      progress: `${quranCompletedCount}/${quranBooks.length}`
    },
    {
      id: 'all_trading',
      emoji: '📖',
      title: 'Trading Master',
      desc: 'Finish every ebook in the Trading category.',
      unlocked: isAllTradingDone,
      progress: `${tradingCompletedCount}/${tradingBooks.length}`
    },
    {
      id: '30_streak',
      emoji: '🔥',
      title: '30-Day Reading Streak',
      desc: 'Maintain a study streak of 30 consecutive days.',
      unlocked: false, // streak is mock-logged as 12
      progress: '12/30 days'
    },
    {
      id: '10_books',
      emoji: '📚',
      title: '10 Books Finished',
      desc: 'Complete a total of 10 ebooks.',
      unlocked: isTenBooksDone,
      progress: `${completedBooks.length}/10`
    },
    {
      id: '50_books',
      emoji: '📚',
      title: '50 Books Finished',
      desc: 'Complete a total of 50 ebooks.',
      unlocked: isFiftyBooksDone,
      progress: `${completedBooks.length}/50`
    }
  ];

  // Timeline Event Card Colors
  const getTimelineCardColors = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-amber-100/40 border-amber-300/20 dark:bg-card dark:border-border-custom';
      case 'book':
        return 'bg-blue-100/40 border-blue-300/20 dark:bg-card dark:border-border-custom';
      case 'milestone':
      default:
        return 'bg-purple-100/40 border-purple-300/20 dark:bg-card dark:border-border-custom';
    }
  };

  // Mock Timeline Milestones
  const TIMELINE_EVENTS = [
    {
      date: 'Aug 3, 2026',
      title: 'Current Progress Sync',
      desc: 'Logged 35 mins of Surah Al-Baqarah Tafsir video progress.',
      type: 'video',
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    },
    {
      date: 'Aug 1, 2026',
      title: 'Finished Ebook: Atomic Habits',
      desc: 'Completed all 320 pages. Journey took 51 days.',
      type: 'milestone',
      icon: Award,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 animate-pulse'
    },
    {
      date: 'Jul 29, 2026',
      title: 'Started Ebook: Tafsir Ibn Kathir',
      desc: 'Read first 35 pages of Surah Al-Baqarah commentary.',
      type: 'book',
      icon: BookOpen,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
      date: 'Jul 28, 2026',
      title: 'Started Ebook: The Productive Muslim',
      desc: 'Began reading chapter on spiritual productivity.',
      type: 'book',
      icon: BookOpen,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
      date: 'Jul 15, 2026',
      title: 'Started Ebook: Trading in the Zone',
      desc: 'Began exploring risk acceptance and trading psychology.',
      type: 'book',
      icon: BookOpen,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
      date: 'Jun 10, 2026',
      title: 'Began Reading Journey',
      desc: 'First ebook added: "Atomic Habits" by James Clear.',
      type: 'milestone',
      icon: Sparkles,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
    }
  ];

  // Mock Durations for completed/in-progress books
  const BOOK_DURATIONS = [
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      status: 'completed',
      duration: 'June - August (2026)',
      days: '51 Days',
      pages: 320,
      collection: 'Self Development',
      startedDate: '10 June 2026',
      completedDate: '01 August 2026',
      readingTime: '17 hours 10 minutes',
      rating: '5/5',
      notesCount: getRealNotesCount('Atomic Habits', 8)
    },
    {
      title: 'Trading in the Zone',
      author: 'Mark Douglas',
      status: 'reading',
      duration: 'July - Present',
      days: 'Active (19 days)',
      pages: 152,
      collection: 'Trading',
      startedDate: '15 July 2026',
      completedDate: 'In Progress',
      readingTime: '8 hours 15 minutes',
      rating: '5/5 (current)',
      notesCount: getRealNotesCount('Trading in the Zone', 4)
    },
    {
      title: 'The Productive Muslim',
      author: 'Mohammed Faris',
      status: 'reading',
      duration: 'July - Present',
      days: 'Active (6 days)',
      pages: 96,
      collection: 'Quran',
      startedDate: '28 July 2026',
      completedDate: 'In Progress',
      readingTime: '4 hours 30 minutes',
      rating: '4/5 (current)',
      notesCount: getRealNotesCount('The Productive Muslim', 2)
    },
    {
      title: 'Tafsir Ibn Kathir (Surah Al-Baqarah)',
      author: 'Imam Ibn Kathir',
      status: 'reading',
      duration: 'July - Present',
      days: 'Active (5 days)',
      pages: 35,
      collection: 'Quran',
      startedDate: '29 July 2026',
      completedDate: 'In Progress',
      readingTime: '1 hour 45 minutes',
      rating: '5/5 (current)',
      notesCount: getRealNotesCount('Tafsir Ibn Kathir (Surah Al-Baqarah)', 1)
    }
  ];

  // Filter book durations based on stat card clicks
  const filteredDurations = BOOK_DURATIONS.filter(book => {
    if (filterType === 'completed') return book.status === 'completed';
    if (filterType === 'reading') return book.status === 'reading';
    return true;
  });

  const toggleExpand = (title: string) => {
    setExpandedBook(prev => prev === title ? null : title);
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-sm font-medium text-muted-custom uppercase tracking-widest mb-1">
          Your Reading Analytics
        </h1>
        <p className="font-handwritten text-4xl font-bold tracking-tight text-header-custom">
          Summary & Timeline
        </p>
      </header>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* Completed */}
        <div 
          onClick={() => setFilterType(prev => prev === 'completed' ? 'all' : 'completed')}
          className={`cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-emerald-100/40 border p-5 rounded-3xl flex flex-col justify-between ${
            filterType === 'completed' 
              ? 'border-emerald-600 ring-2 ring-emerald-500/20' 
              : 'border-emerald-300/30 dark:bg-card dark:border-border-custom'
          }`}
          title="Click to filter completed books below"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold text-emerald-955/80 dark:text-muted-custom tracking-wider block">
              Completed
            </span>
            <span className="text-2xl font-serif font-bold text-emerald-955 dark:text-foreground mt-1 block">
              {completedBooks.length} Books
            </span>
            <span className="text-[9px] text-emerald-700/80 font-bold block mt-1 dark:text-emerald-400">
              {filterType === 'completed' ? '• Filtering Active' : 'Click to filter list'}
            </span>
          </div>
        </div>

        {/* Pages Read */}
        <div 
          onClick={() => setFilterType(prev => prev === 'reading' ? 'all' : 'reading')}
          className={`cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-blue-100/40 border p-5 rounded-3xl flex flex-col justify-between ${
            filterType === 'reading' 
              ? 'border-blue-600 ring-2 ring-blue-500/20' 
              : 'border-blue-300/30 dark:bg-card dark:border-border-custom'
          }`}
          title="Click to filter active reading books below"
        >
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-500" />
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold text-blue-955/80 dark:text-muted-custom tracking-wider block">
              Pages Read
            </span>
            <span className="text-2xl font-serif font-bold text-blue-955 dark:text-foreground mt-1 block">
              {totalPagesRead} Pages
            </span>
            <span className="text-[9px] text-blue-700/80 font-bold block mt-1 dark:text-blue-400">
              {filterType === 'reading' ? '• Filtering Active' : 'Click to filter reading'}
            </span>
          </div>
        </div>

        {/* Watch Time */}
        <div className="bg-amber-100/40 border border-amber-300/30 dark:bg-card dark:border-border-custom p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold text-amber-955/80 dark:text-muted-custom tracking-wider block">
              Watch Time
            </span>
            <span className="text-2xl font-serif font-bold text-amber-955 dark:text-foreground mt-1 block">
              {totalDurationMin} Mins
            </span>
            <span className="text-[9px] text-amber-700/80 font-bold block mt-1 dark:text-amber-400 opacity-0 select-none">
              Spacer
            </span>
          </div>
        </div>

        {/* Active Streak */}
        <div className="bg-purple-100/40 border border-purple-300/30 dark:bg-card dark:border-border-custom p-5 rounded-3xl shadow-sm flex flex-col justify-between">
          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-500" />
          <div className="mt-4">
            <span className="text-[10px] uppercase font-bold text-purple-955/80 dark:text-muted-custom tracking-wider block">
              Active Streak
            </span>
            <span className="text-2xl font-serif font-bold text-purple-955 dark:text-foreground mt-1 block">
              12 Days
            </span>
            <span className="text-[9px] text-purple-700/80 font-bold block mt-1 dark:text-purple-400 opacity-0 select-none">
              Spacer
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left 3 Columns: Ebook Timeline Duration Summary & Achievement Badges */}
        <div className="md:col-span-3 flex flex-col gap-8">
          
          {/* Reading Durations List */}
          <section className="bg-card border border-border-custom rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif text-lg font-bold tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-gold" /> Reading Durations
              </h2>
              {filterType !== 'all' && (
                <button
                  onClick={() => setFilterType('all')}
                  className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Clear Filter
                </button>
              )}
            </div>
            <p className="text-xs text-muted-custom mb-5">
              {filterType === 'all' 
                ? 'Approximate months and total days taken to study each material. Click any card to see full logs.'
                : `Showing ${filterType} books only. Click card to see full logs.`}
            </p>

            <div className="flex flex-col gap-4">
              {filteredDurations.map((item, idx) => {
                const colors = getCategoryColors(item.collection);
                const isExpanded = expandedBook === item.title;
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleExpand(item.title)}
                    className={`flex flex-col p-4 border rounded-2xl text-xs gap-3 transition-all cursor-pointer hover:border-accent-gold/45 duration-200 hover:-translate-y-0.5 hover:shadow-sm ${colors.rowBg}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-serif font-bold text-sm text-foreground truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-custom mt-0.5">
                          by {item.author}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-custom">
                          <span className="font-semibold text-foreground">{item.duration}</span>
                          <span>•</span>
                          <span>{item.pages} pages read</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${colors.badge}`}>
                          {item.days}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-custom" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-custom" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border-custom/50 flex flex-col gap-2.5 text-xs text-foreground/90 animate-slide-in select-all">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span className="font-medium text-muted-custom">Started:</span>
                          <span className="font-semibold">{item.startedDate}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span className="font-medium text-muted-custom">Completed:</span>
                          <span className={`font-semibold ${item.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                            {item.completedDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>⏱️</span>
                          <span className="font-medium text-muted-custom">Total reading time:</span>
                          <span className="font-semibold">{item.readingTime}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>⭐</span>
                          <span className="font-medium text-muted-custom">Your rating:</span>
                          <span className="font-semibold text-accent-gold">{item.rating}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>📝</span>
                          <span className="font-medium text-muted-custom">Notes written:</span>
                          <span className="font-semibold">{item.notesCount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Achievement Badges Section */}
          <section className="bg-card border border-border-custom rounded-3xl p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold tracking-tight mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-accent-gold" /> Achievement Badges
            </h2>
            <p className="text-xs text-muted-custom mb-5">
              Personal milestone targets to keep you motivated and structured.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BADGES.map((badge) => {
                return (
                  <div 
                    key={badge.id}
                    className={`p-4 border rounded-2xl flex flex-col gap-3 relative transition-all duration-300 ${
                      badge.unlocked 
                        ? 'bg-accent-gold/5 border-accent-gold/40' 
                        : 'bg-foreground/5 border-border-custom/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl select-none">{badge.emoji}</span>
                        <h4 className="font-serif font-bold text-xs text-foreground leading-snug">
                          {badge.title}
                        </h4>
                      </div>
                      
                      {badge.unlocked ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-muted-custom shrink-0" />
                      )}
                    </div>

                    <p className="text-[10px] text-muted-custom leading-normal">
                      {badge.desc}
                    </p>

                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-custom mt-1 border-t border-border-custom/20 pt-2.5">
                      <span>Status</span>
                      <span className={badge.unlocked ? 'text-accent-gold' : 'text-neutral-500'}>
                        {badge.unlocked ? `Unlocked (${badge.progress})` : `Locked (${badge.progress})`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* Right 2 Columns: Chronological Reading Timeline */}
        <div className="md:col-span-2">
          
          <section className="bg-card border border-border-custom rounded-3xl p-6 shadow-sm h-full">
            <h2 className="font-serif text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-accent-gold" /> Reading Timeline
            </h2>

            <div className="relative border-l border-border-custom ml-3 pl-5 flex flex-col gap-6 py-1">
              {TIMELINE_EVENTS.map((event, idx) => {
                const EvIcon = event.icon;
                const cardColors = getTimelineCardColors(event.type);
                return (
                  <div key={idx} className="relative">
                    {/* Node Circle */}
                    <span className={`absolute -left-[30px] top-2.5 p-1 rounded-full border border-border-custom z-10 ${event.color}`}>
                      <EvIcon className="w-3 h-3" />
                    </span>
                    
                    <div className={`p-3.5 border rounded-2xl shadow-sm text-xs ${cardColors}`}>
                      <span className="text-[9px] font-mono font-bold text-muted-custom block tracking-wider uppercase">
                        {event.date}
                      </span>
                      <h4 className="font-serif font-bold text-xs text-foreground mt-1 leading-snug">
                        {event.title}
                      </h4>
                      <p className="text-[10px] text-muted-custom mt-1 leading-normal">
                        {event.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
