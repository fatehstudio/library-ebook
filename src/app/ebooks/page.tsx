'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Star, 
  Play, 
  CheckCircle2, 
  PauseCircle, 
  HelpCircle,
  X,
  Clock,
  BookOpen,
  Sparkles,
  Plus
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';

const getCategoryColors = (collection: string) => {
  const normalized = collection.toLowerCase().trim();
  switch (normalized) {
    case 'quran':
      return {
        cardBg: 'bg-emerald-100/40 border-emerald-300/30 dark:bg-card dark:border-border-custom',
        coverBg: 'bg-emerald-200/50 border-emerald-400/30 text-emerald-955 dark:bg-emerald-955/40 dark:border-emerald-500/20 dark:text-emerald-400',
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
        badge: 'bg-emerald-500/10 text-amber-600 dark:text-amber-400'
      };
    default:
      return {
        cardBg: 'bg-stone-100/40 border-stone-300/30 dark:bg-card dark:border-border-custom',
        coverBg: 'bg-stone-200/50 border-stone-400/30 text-stone-955 dark:bg-stone-900 dark:border-stone-700 dark:text-stone-300',
        badge: 'bg-stone-500/10 text-stone-600 dark:text-stone-400'
      };
  }
};
const MOTIVATIONAL_QUOTES = [
  {
    text: "The best of people are those that bring most benefit to the rest of mankind.",
    author: "Prophet Muhammad (ﷺ)"
  },
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear"
  },
  {
    text: "Consistency in trading is built upon the acceptance of risk. When you accept risk, you accept outcomes.",
    author: "Mark Douglas"
  },
  {
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe"
  },
  {
    text: "Do not lose hope, nor be sad, for you will surely overcome if you are true in faith.",
    author: "Surah Ali 'Imran (3:139)"
  },
  {
    text: "The key to trading success is emotional discipline. If intelligence was key, many more would succeed.",
    author: "Victor Sperandeo"
  },
  {
    text: "Barakah is the attachment of divine goodness to a thing; if it is tiny, it increases.",
    author: "Islamic Wisdom"
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    text: "The master has failed more times than the beginner has even tried.",
    author: "Stephen McCranie"
  },
  {
    text: "Patience is not the ability to wait, but the ability to keep a good attitude while waiting.",
    author: "Growth Mindset"
  }
];

function EbooksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { books, collections, updateBookProgress, updateBookRating, toggleBookFavorite, updateItemCollection, updateBookCover, searchPageContents, syncGoogleDrive, isSyncing } = useLibrary();

  // Set initial daily quote index based on calendar day
  const dayOfMonth = new Date().getDate();
  const dailyIndex = dayOfMonth % MOTIVATIONAL_QUOTES.length;
  const [quoteIndex, setQuoteIndex] = useState(dailyIndex);

  const handleNextQuote = () => {
    let nextIdx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    while (nextIdx === quoteIndex) {
      nextIdx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    }
    setQuoteIndex(nextIdx);
  };
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedBook, setSelectedBook] = useState<{ id: string } | null>(null);
  const [pageInput, setPageInput] = useState('');
  const [totalPagesInput, setTotalPagesInput] = useState('');
  const [coverInput, setCoverInput] = useState('');

  // Page-level full-text search states
  const [searchInsidePages, setSearchInsidePages] = useState(false);
  const [pageSearchResults, setPageSearchResults] = useState<any[]>([]);
  const [isSearchingPages, setIsSearchingPages] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Add Ebook Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Bulk select & categorize states
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');

  const activeBook = books.find(b => b.id === selectedBook?.id) || null;

  const handleCardClick = (book: any) => {
    if (isBulkMode) {
      if (selectedBookIds.includes(book.id)) {
        setSelectedBookIds(selectedBookIds.filter(id => id !== book.id));
      } else {
        setSelectedBookIds([...selectedBookIds, book.id]);
      }
    } else {
      setSelectedBook({ id: book.id });
    }
  };

  const handleBulkCategorize = async () => {
    if (!bulkCategory || selectedBookIds.length === 0) return;
    
    if (confirm(`Are you sure you want to move ${selectedBookIds.length} books to "${bulkCategory}"?`)) {
      for (const id of selectedBookIds) {
        await updateItemCollection(id, bulkCategory);
      }
      setSelectedBookIds([]);
      setIsBulkMode(false);
      setBulkCategory('');
    }
  };

  // Sync details drawer input with active book page
  useEffect(() => {
    if (activeBook) {
      setPageInput(activeBook.currentPage.toString());
      setTotalPagesInput(activeBook.totalPages.toString());
      setCoverInput(activeBook.coverImageUrl || '');
    }
  }, [selectedBook?.id, activeBook?.currentPage, activeBook?.totalPages, activeBook?.coverImageUrl]);

  // Sync category param from homepage clicks
  useEffect(() => {
    const colParam = searchParams.get('collection');
    if (colParam && (colParam === 'all' || collections.some(c => c.slug === colParam))) {
      setSelectedCollection(colParam);
    }
  }, [searchParams, collections]);

  const performPageSearch = async () => {
    if (search.trim().length > 2) {
      setIsSearchingPages(true);
      setSearchError(null);
      try {
        const res = await searchPageContents(search.trim());
        setPageSearchResults(res);
      } catch (err: any) {
        console.error('Page search failed:', err);
        setSearchError('Connection error or slow internet. Please check your network and click retry.');
      } finally {
        setIsSearchingPages(false);
      }
    } else {
      setPageSearchResults([]);
      setSearchError(null);
    }
  };

  // Trigger page content full-text search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchInsidePages) {
        performPageSearch();
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, searchInsidePages]);

  // Filter Logic
  const filteredBooks = books.filter(book => {
    // 1. Search Query Match
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) || 
                          book.author.toLowerCase().includes(search.toLowerCase()) ||
                          book.collection.toLowerCase().includes(search.toLowerCase());
    
    // 2. Reading Status Match
    let matchesStatus = true;
    if (statusFilter === 'favorites') {
      matchesStatus = book.isFavorite;
    } else if (statusFilter !== 'all') {
      matchesStatus = book.status === statusFilter;
    }

    // 3. Collection/Category Match
    let matchesCollection = true;
    if (selectedCollection !== 'all') {
      matchesCollection = book.collection.toLowerCase().replace(' ', '-') === selectedCollection;
    }

    return matchesSearch && matchesStatus && matchesCollection;
  });

  const drawerColors = activeBook ? getCategoryColors(activeBook.collection) : null;

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full relative">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-sm font-medium text-muted-custom uppercase tracking-widest mb-1">
            Ebooks Repository
          </h1>
          <p className="font-handwritten text-5xl md:text-6xl font-bold tracking-tight text-header-custom">
            Library
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4.5 py-2.5 rounded-2xl text-xs font-bold bg-accent-gold text-background hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Ebook
          </button>
          <button
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              setSelectedBookIds([]);
            }}
            className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isBulkMode
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-card border-border-custom text-muted-custom hover:text-foreground'
            }`}
          >
            {isBulkMode ? 'Cancel Select' : 'Bulk Select'}
          </button>
        </div>
      </header>

      {/* Daily Motivational Quote Card */}
      <div 
        onClick={handleNextQuote}
        className="mb-8 p-5 bg-card/45 hover:bg-card/75 border border-border-custom/50 rounded-3xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group flex items-start justify-between gap-4 select-none relative overflow-hidden"
        title="Click to switch quote"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-accent-gold/5 blur-xl pointer-events-none" />
        
        <div className="flex-1 relative z-10">
          <span className="text-[8px] font-bold text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full border border-accent-gold/20 uppercase tracking-widest inline-flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Quote of the Day
          </span>
          <p className="font-serif italic text-xs md:text-sm text-foreground mt-2.5 leading-relaxed">
            "{MOTIVATIONAL_QUOTES[quoteIndex].text}"
          </p>
          <p className="text-[10px] text-muted-custom font-bold uppercase tracking-wider mt-2.5">
            — {MOTIVATIONAL_QUOTES[quoteIndex].author}
          </p>
        </div>
        <span className="text-[9px] font-bold text-muted-custom uppercase tracking-wider shrink-0 bg-foreground/5 group-hover:bg-accent-gold/15 group-hover:text-accent-gold px-2.5 py-1 rounded-xl transition-all self-center relative z-10">
          Next Quote ✦
        </span>
      </div>

      {/* Search Input */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-custom" />
          <input
            type="text"
            placeholder="Search by title, author, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-card border border-border-custom rounded-2xl text-sm focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-all text-foreground"
          />
        </div>
        
        {/* Toggle search inside pages */}
        <div className="flex items-center gap-2 px-1">
          <input 
            type="checkbox"
            id="searchPages"
            checked={searchInsidePages}
            onChange={(e) => setSearchInsidePages(e.target.checked)}
            className="w-3.5 h-3.5 accent-accent-gold cursor-pointer"
          />
          <label htmlFor="searchPages" className="text-xs text-muted-custom hover:text-foreground transition-colors cursor-pointer select-none">
            Search inside book pages (Full-text content search)
          </label>
        </div>
      </div>

      {/* Dual Filter Rows */}
      <div className="flex flex-col gap-4 mb-8 bg-card border border-border-custom p-4 rounded-3xl shadow-sm">
        
        {/* Status Filters */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-custom">
            Reading Status
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
            {[
              { value: 'all', label: 'All Statuses' },
              { value: 'reading', label: 'Currently Reading' },
              { value: 'not_started', label: 'To Read' },
              { value: 'paused', label: 'Paused' },
              { value: 'completed', label: 'Completed' },
              { value: 'favorites', label: 'Favorites' }
            ].map((chip) => (
              <button
                key={chip.value}
                onClick={() => setStatusFilter(chip.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all ${
                  statusFilter === chip.value
                    ? 'bg-accent-gold border-accent-gold text-background'
                    : 'bg-background border-border-custom text-muted-custom hover:border-foreground/20 hover:text-foreground'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category / Collection Filters */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-custom">
            Book Categories
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
            <button
              onClick={() => setSelectedCollection('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all ${
                selectedCollection === 'all'
                  ? 'bg-accent-gold border-accent-gold text-background'
                  : 'bg-background border-border-custom text-muted-custom hover:border-foreground/20 hover:text-foreground'
              }`}
            >
              All Categories
            </button>
            {collections.map((col) => (
              <button
                key={col.slug}
                onClick={() => setSelectedCollection(col.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all ${
                  selectedCollection === col.slug
                    ? 'bg-accent-gold border-accent-gold text-background'
                    : 'bg-background border-border-custom text-muted-custom hover:border-foreground/20 hover:text-foreground'
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        </div>
        
      </div>

      {/* Page Content Search Results */}
      {searchInsidePages && search.trim().length > 2 && (
        <div className="mb-8 border border-border-custom bg-card/60 backdrop-blur-md rounded-3xl p-6 shadow-md animate-fade-in">
          <h3 className="font-serif text-lg font-bold mb-4 text-header-custom flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-gold" />
            Page Content Matches ({pageSearchResults.length})
          </h3>
          
          {isSearchingPages ? (
            <div className="flex items-center gap-2 py-4 text-xs text-muted-custom font-semibold">
              <span className="w-4 h-4 border-2 border-accent-gold border-t-transparent rounded-full animate-spin animate-duration-1000" />
              Searching inside ebook PDF pages...
            </div>
          ) : searchError ? (
            <div className="flex flex-col gap-3 py-3 items-start animate-fade-in">
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2 w-full">
                ⚠️ {searchError}
              </div>
              <button
                onClick={performPageSearch}
                className="px-4 py-2 bg-accent-gold text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-sm"
              >
                Retry Search 🔄
              </button>
            </div>
          ) : pageSearchResults.length === 0 ? (
            <p className="text-xs text-muted-custom py-2">No page matches found for "{search}". Try another keyword.</p>
          ) : (
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
              {pageSearchResults.map((result) => (
                <div 
                  key={result.id}
                  className="p-4 bg-background border border-border-custom/50 rounded-2xl flex items-center justify-between gap-4 hover:border-accent-gold/30 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold bg-accent-gold/10 text-accent-gold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {result.bookTitle}
                      </span>
                      <span className="text-[10px] font-mono bg-foreground/5 text-muted-custom px-2 py-0.5 rounded-full font-bold">
                        Page {result.pageNumber}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 italic line-clamp-2 leading-relaxed bg-foreground/[0.02] p-2 rounded-xl border border-foreground/[0.04]">
                      {result.contentSnippet}
                    </p>
                  </div>
                  
                  <Link
                    href={`/ebooks/read/${result.bookId}?page=${result.pageNumber}`}
                    className="px-4 py-2 bg-accent-gold text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all shrink-0 shadow-sm"
                  >
                    Open Page
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-custom rounded-3xl p-6">
          <BookOpen className="w-12 h-12 text-muted-custom mb-3 opacity-50" />
          <h3 className="font-serif text-lg font-bold">
            {search ? 'No books match your query' : 'Your library is empty'}
          </h3>
          <p className="text-xs text-muted-custom max-w-xs mt-1">
            {search 
              ? 'Try adjusting your search terms or filters.' 
              : 'Add your first ebook to begin reading.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredBooks.map((book) => {
            const colors = getCategoryColors(book.collection);
            return (
              <div 
                key={book.id} 
                onClick={() => handleCardClick(book)}
                className={`group cursor-pointer flex flex-col gap-3 p-3.5 border rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-accent-gold/45 relative ${
                  isBulkMode && selectedBookIds.includes(book.id)
                    ? 'border-accent-gold ring-2 ring-accent-gold/20'
                    : colors.cardBg
                }`}
              >
                {/* 3D Skeuomorphic Cover */}
                <div className="aspect-[2/3] w-full book-cover-3d relative overflow-hidden rounded-2xl border border-border-custom/50 shadow-inner">
                  {book.coverImageUrl ? (
                    <img 
                      src={book.coverImageUrl} 
                      alt={book.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className={`w-full h-full p-4 font-serif text-xs select-none flex flex-col justify-between ${colors.coverBg}`}>
                      <span className="font-bold leading-snug text-sm line-clamp-4">{book.title}</span>
                      <span className="text-[10px] opacity-75">{book.author}</span>
                    </div>
                  )}

                  {isBulkMode ? (
                    <div className="absolute top-2 left-2 z-10 bg-black/60 p-1.5 rounded-full">
                      <input 
                        type="checkbox" 
                        checked={selectedBookIds.includes(book.id)} 
                        onChange={() => {}} 
                        className="w-4 h-4 accent-accent-gold cursor-pointer"
                      />
                    </div>
                  ) : book.isFavorite ? (
                    <div className="absolute top-2 right-2 text-accent-gold z-10 bg-black/40 p-1.5 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-accent-gold" />
                    </div>
                  ) : null}
                </div>

                {/* Text area */}
                <div className="px-0.5">
                  <h3 className="font-serif font-bold text-sm text-foreground truncate group-hover:text-accent-gold transition-colors leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-custom truncate mb-2">
                    by {book.author}
                  </p>

                  {book.status === 'not_started' ? (
                    <span className="text-[9px] font-bold text-neutral-500 bg-neutral-500/10 px-2 py-0.5 rounded-full dark:bg-neutral-900 border border-border-custom uppercase tracking-wider">
                      Unread
                    </span>
                  ) : book.status === 'completed' ? (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase tracking-wider">
                      Completed
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-gold rounded-full" style={{ width: `${book.progress}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-accent-gold">{book.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {isBulkMode && selectedBookIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-lg w-[90%] bg-card/85 backdrop-blur-md border border-border-custom rounded-3xl p-4 shadow-xl z-50 flex items-center justify-between gap-4 animate-fade-in">
          <div className="text-xs font-semibold text-foreground">
            <span className="text-accent-gold font-bold">{selectedBookIds.length}</span> books selected
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="bg-background border border-border-custom rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer font-semibold"
            >
              <option value="">Move to...</option>
              {collections.map((c) => (
                <option key={c.slug} value={c.name}>{c.name}</option>
              ))}
            </select>
            
            <button
              onClick={handleBulkCategorize}
              disabled={!bulkCategory}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                bulkCategory 
                  ? 'bg-accent-gold text-background hover:opacity-90' 
                  : 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
              }`}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Book Detail Drawer/Sidebar Panel */}
      {activeBook && drawerColors && (
        <>
          <div 
            onClick={() => setSelectedBook(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-card border-l border-border-custom p-6 md:p-8 flex flex-col justify-between z-40 shadow-2xl transition-transform animate-slide-in">
            <div className="overflow-y-auto pr-1 flex-1 pb-6">
              
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold bg-accent-gold/10 text-accent-gold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {activeBook.collection} Collection
                </span>
                
                <div className="flex items-center">
                  {/* Favorite Toggle Button */}
                  <button 
                    onClick={() => toggleBookFavorite(activeBook.id)}
                    className="p-2 rounded-full hover:bg-foreground/5 text-muted-custom hover:text-accent-gold transition-all mr-1 cursor-pointer"
                    title={activeBook.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Star className={`w-5 h-5 ${activeBook.isFavorite ? 'text-accent-gold fill-accent-gold' : ''}`} />
                  </button>

                  <button 
                    onClick={() => setSelectedBook(null)}
                    className="p-2 rounded-full hover:bg-foreground/5 text-muted-custom hover:text-foreground transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Cover & Rating details */}
              <div className="flex gap-5 mb-6">
                <div className="w-24 h-36 book-cover-3d relative overflow-hidden rounded-xl shrink-0 border border-border-custom/50 shadow-inner">
                  {activeBook.coverImageUrl ? (
                    <img 
                      src={activeBook.coverImageUrl} 
                      alt={activeBook.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className={`w-full h-full p-3 font-serif text-[10px] flex flex-col justify-between ${drawerColors.coverBg}`}>
                      <span className="font-bold leading-tight line-clamp-4">{activeBook.title}</span>
                      <span className="text-[8px] opacity-75">{activeBook.author}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h2 className="font-serif text-xl font-bold tracking-tight text-foreground leading-snug">
                    {activeBook.title}
                  </h2>
                  <p className="text-sm text-muted-custom mt-1 mb-3">
                    by {activeBook.author}
                  </p>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateBookRating(activeBook.id, star)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star 
                          className={`w-4 h-4 ${
                            star <= activeBook.rating 
                              ? 'text-accent-gold fill-accent-gold' 
                              : 'text-neutral-600 hover:text-accent-gold/50'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kindle & Apple Readonly stats list */}
              <div className="mb-6 border-t border-b border-border-custom py-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-custom">Reading Status</span>
                  <span className="font-semibold flex items-center gap-1 capitalize text-foreground">
                    {activeBook.status === 'reading' && <Play className="w-3.5 h-3.5 text-accent-gold fill-accent-gold/10" />}
                    {activeBook.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {activeBook.status === 'paused' && <PauseCircle className="w-3.5 h-3.5 text-amber-500" />}
                    {activeBook.status === 'not_started' && <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />}
                    {activeBook.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-custom">Category</span>
                  <select
                    value={activeBook.collection}
                    onChange={(e) => updateItemCollection(activeBook.id, e.target.value)}
                    className="bg-card border border-border-custom/50 rounded-xl px-2.5 py-1 text-xs text-foreground focus:outline-none cursor-pointer font-semibold"
                  >
                    {collections.map(c => (
                      <option key={c.slug} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-custom">Current Page</span>
                  <span className="font-semibold text-foreground">
                    {activeBook.currentPage} / {activeBook.totalPages} pages ({activeBook.progress}%)
                  </span>
                </div>

                {/* Kindle-Style Time Remaining estimate */}
                {activeBook.status !== 'completed' && (
                  <div className="flex items-center justify-between text-xs animate-fade-in">
                    <span className="text-muted-custom">Time to Finish</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent-gold" />
                      <span>{Math.ceil((activeBook.totalPages - activeBook.currentPage) * 1.5)} mins left</span>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-custom">Synced Date</span>
                  <span className="font-semibold flex items-center gap-1 font-mono text-foreground">
                    <Clock className="w-3.5 h-3.5 text-muted-custom" /> {activeBook.dateAdded}
                  </span>
                </div>
              </div>

              {/* Interactive manual progress input */}
              <div className="mb-6 bg-foreground/5 p-4 rounded-2xl border border-border-custom/50">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-custom mb-3">
                  Log Reading Progress
                </h4>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center bg-background border border-border-custom rounded-xl px-3 py-2">
                      <span className="text-[9px] uppercase font-bold text-muted-custom mr-2">Current</span>
                      <input
                        type="number"
                        min="0"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        className="w-full bg-transparent text-foreground font-semibold text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    
                    <span className="text-muted-custom">/</span>
                    
                    <div className="flex-1 flex items-center bg-background border border-border-custom rounded-xl px-3 py-2">
                      <span className="text-[9px] uppercase font-bold text-muted-custom mr-2">Total</span>
                      <input
                        type="number"
                        min="1"
                        value={totalPagesInput}
                        onChange={(e) => setTotalPagesInput(e.target.value)}
                        className="w-full bg-transparent text-foreground font-semibold text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={async () => {
                      const curVal = parseInt(pageInput, 10);
                      const totVal = parseInt(totalPagesInput, 10);
                      if (!isNaN(curVal) && !isNaN(totVal) && curVal >= 0 && totVal >= 1) {
                        if (curVal > totVal) {
                          alert("Current page cannot be greater than total pages!");
                          return;
                        }
                        await updateBookProgress(activeBook.id, curVal, totVal);
                        alert("Reading progress updated successfully!");
                      } else {
                        alert("Please enter valid current page (>= 0) and total pages (>= 1).");
                      }
                    }}
                    className="w-full py-2.5 bg-accent-gold text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-sm"
                  >
                    Save Progress & Total Pages
                  </button>
                </div>
              </div>

              {/* Custom Cover Input */}
              <div className="mb-6 bg-foreground/5 p-4 rounded-2xl border border-border-custom/50 animate-fade-in">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-custom mb-3">
                  Set Book Cover Image
                </h4>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Paste book cover image URL..."
                    value={coverInput}
                    onChange={(e) => setCoverInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-background border border-border-custom rounded-xl text-xs text-foreground focus:outline-none focus:border-accent-gold"
                  />
                  <button
                    onClick={async () => {
                      await updateBookCover(activeBook.id, coverInput);
                      alert('Book cover updated successfully!');
                    }}
                    className="px-4 py-2.5 bg-accent-gold text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shrink-0"
                  >
                    Save Cover
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom PDF Reader Trigger */}
            <button
              onClick={() => router.push(`/ebooks/read/${activeBook.id}`)}
              className="w-full py-4 rounded-2xl bg-accent-gold text-background border border-accent-gold font-bold shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-300 shrink-0 cursor-pointer"
            >
              Open PDF Reader
            </button>
          </div>
        </>
      )}

      {/* Add Ebook Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 bg-card border border-border-custom rounded-3xl shadow-xl animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-header-custom flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-gold" />
                Add Ebook to Library
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-foreground/5 text-muted-custom transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-xs text-foreground/80 leading-relaxed mb-6 space-y-3">
              <p>
                Your library is linked to the <strong>Google Drive</strong> folder: 
                <span className="block mt-1 font-mono bg-foreground/5 p-2 rounded-xl border border-foreground/[0.04] text-foreground font-semibold">
                  /Knowledge Library
                </span>
              </p>
              <div className="p-3 bg-accent-gold/5 border border-accent-gold/20 rounded-2xl text-[11px] leading-relaxed">
                <strong className="text-accent-gold font-bold">Steps to add new PDF:</strong>
                <ol className="list-decimal pl-4.5 mt-1 space-y-1 font-semibold">
                  <li>Upload the PDF file to your Google Drive under folder <strong>Knowledge Library</strong>.</li>
                  <li>Click <strong>Open Google Drive</strong> to access folder.</li>
                  <li>Click <strong>Sync Now</strong> below to import!</li>
                </ol>
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <a 
                href="https://drive.google.com/drive/my-drive"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-foreground text-background font-bold rounded-2xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all text-center shadow-sm"
              >
                Open Google Drive 🌐
              </a>
              
              <button
                disabled={isSyncing}
                onClick={async () => {
                  await syncGoogleDrive();
                  setIsAddModalOpen(false);
                }}
                className="w-full py-3 bg-accent-gold text-background font-bold rounded-2xl text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
              >
                {isSyncing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    Sync Now 🔄
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Ebooks() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-6 text-muted-custom font-serif text-sm">
        Loading library...
      </div>
    }>
      <EbooksContent />
    </Suspense>
  );
}
