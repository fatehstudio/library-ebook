'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Star, 
  Play, 
  CheckCircle2, 
  PauseCircle, 
  HelpCircle,
  X,
  Clock,
  BookOpen
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

function EbooksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { books, collections, updateBookProgress, updateBookRating, toggleBookFavorite, updateItemCollection } = useLibrary();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedBook, setSelectedBook] = useState<{ id: string } | null>(null);
  const [pageInput, setPageInput] = useState('');

  const activeBook = books.find(b => b.id === selectedBook?.id) || null;

  // Sync details drawer input with active book page
  useEffect(() => {
    if (activeBook) {
      setPageInput(activeBook.currentPage.toString());
    }
  }, [selectedBook?.id, activeBook?.currentPage]);

  // Sync category param from homepage clicks
  useEffect(() => {
    const colParam = searchParams.get('collection');
    if (colParam && (colParam === 'all' || collections.some(c => c.slug === colParam))) {
      setSelectedCollection(colParam);
    }
  }, [searchParams, collections]);

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
      <header className="mb-8">
        <h1 className="text-sm font-medium text-muted-custom uppercase tracking-widest mb-1">
          Ebooks Repository
        </h1>
        <p className="font-handwritten text-4xl font-bold tracking-tight text-header-custom">
          Library
        </p>
      </header>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-custom" />
        <input
          type="text"
          placeholder="Search by title, author, or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-card border border-border-custom rounded-2xl text-sm focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-all text-foreground"
        />
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

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-custom rounded-3xl p-6">
          <BookOpen className="w-12 h-12 text-muted-custom mb-3 opacity-50" />
          <h3 className="font-serif text-lg font-bold">No books found</h3>
          <p className="text-xs text-muted-custom max-w-xs mt-1">
            Try adjusting your category or status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredBooks.map((book) => {
            const colors = getCategoryColors(book.collection);
            return (
              <div 
                key={book.id} 
                onClick={() => setSelectedBook({ id: book.id })}
                className={`group cursor-pointer flex flex-col gap-3 p-3.5 border rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-accent-gold/45 ${colors.cardBg}`}
              >
                {/* 3D Skeuomorphic Cover */}
                <div className={`aspect-[2/3] w-full book-cover-3d p-4 font-serif text-xs select-none flex flex-col justify-between relative ${colors.coverBg}`}>
                  {book.isFavorite && (
                    <div className="absolute top-2 right-2 text-accent-gold z-10">
                      <Star className="w-4 h-4 fill-accent-gold" />
                    </div>
                  )}
                  <span className="font-bold leading-snug text-sm line-clamp-4">{book.title}</span>
                  <span className="text-[10px] opacity-75">{book.author}</span>
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
                <div className={`w-24 h-36 book-cover-3d p-3 font-serif text-[10px] flex flex-col justify-between shrink-0 ${drawerColors.coverBg}`}>
                  <span className="font-bold leading-tight line-clamp-4">{activeBook.title}</span>
                  <span className="text-[8px] opacity-75">{activeBook.author}</span>
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
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center bg-background border border-border-custom rounded-xl px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      max={activeBook.totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      className="w-16 bg-transparent text-foreground font-semibold text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs text-muted-custom ml-1">/ {activeBook.totalPages} pages</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      const val = parseInt(pageInput, 10);
                      if (!isNaN(val) && val >= 0 && val <= activeBook.totalPages) {
                        updateBookProgress(activeBook.id, val);
                      } else {
                        alert(`Please enter a valid page number between 0 and ${activeBook.totalPages}.`);
                      }
                    }}
                    className="px-4 py-2.5 bg-accent-gold text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shrink-0"
                  >
                    Save Progress
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
