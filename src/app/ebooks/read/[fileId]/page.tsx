'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Save, 
  FileText, 
  BookMarked,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';

export default function ReadEbook({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = use(params);
  const router = useRouter();
  const { books, highlights, updateBookProgress, addHighlight } = useLibrary();

  const [activeBook, setActiveBook] = useState<any>(null);
  const [currentPageInput, setCurrentPageInput] = useState<string>('');
  const [highlightText, setHighlightText] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('turquoise');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [noteSuccess, setNoteSuccess] = useState<boolean>(false);

  useEffect(() => {
    const book = books.find(b => b.id === fileId);
    if (book) {
      setActiveBook(book);
      setCurrentPageInput(book.currentPage.toString());
    }
  }, [books, fileId]);

  if (!activeBook) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted-custom font-serif text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-gold mb-3" />
        Loading ebook metadata...
      </div>
    );
  }

  // Get stream source URL
  const streamUrl = activeBook.googleDriveFileId 
    ? `/api/library/stream/${activeBook.googleDriveFileId}`
    : '';

  // Filter highlights related to this book title
  const bookHighlights = highlights.filter(h => 
    h.source.toLowerCase().trim() === activeBook.title.toLowerCase().trim()
  );

  const handleProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(currentPageInput, 10);
    if (isNaN(pageNum) || pageNum < 0 || pageNum > activeBook.totalPages) {
      alert(`Please enter a valid page number between 0 and ${activeBook.totalPages}.`);
      return;
    }
    await updateBookProgress(activeBook.id, pageNum);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlightText.trim()) {
      alert('Please enter some highlight text.');
      return;
    }

    let colorHsl = 'hsl(174, 75%, 85%)'; // Pastel turquoise default
    if (selectedColor === 'pink') colorHsl = 'hsl(327, 73%, 90%)';
    if (selectedColor === 'gold') colorHsl = 'hsl(45, 100%, 82%)';

    await addHighlight(activeBook.id, highlightText.trim(), noteText.trim(), colorHsl);
    setHighlightText('');
    setNoteText('');
    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 2000);
  };

  return (
    <div className="flex-1 h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left side: Interactive PDF Stream IFrame */}
      <div className="flex-1 h-2/3 md:h-full p-4 flex flex-col">
        {/* Navigation & Header */}
        <header className="flex items-center justify-between mb-3 px-1 shrink-0">
          <div className="flex items-center gap-3">
            <Link 
              href="/ebooks" 
              className="p-2 border border-border-custom/50 rounded-xl bg-card hover:bg-foreground/5 text-muted-custom hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-serif font-bold text-sm md:text-base text-foreground line-clamp-1 max-w-md">
                {activeBook.title}
              </h1>
              <p className="text-[10px] text-muted-custom">by {activeBook.author}</p>
            </div>
          </div>
          
          <div className="text-[10px] font-bold text-accent-gold bg-accent-gold/10 px-2.5 py-1 rounded-full border border-accent-gold/25 uppercase tracking-wider">
            {activeBook.progress}% Read
          </div>
        </header>

        {/* PDF Frame wrapper */}
        <div className="flex-1 rounded-3xl overflow-hidden border border-border-custom bg-card/30 relative">
          {streamUrl ? (
            <iframe 
              src={`${streamUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full"
              title={activeBook.title}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-muted-custom select-none">
              <BookOpen className="w-12 h-12 text-muted-custom mb-3 opacity-30 animate-pulse" />
              <p className="font-serif text-sm font-bold">PDF stream not available</p>
              <p className="text-xs mt-1 max-w-xs">Verify this file is synced properly from Google Drive.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Kindle-style Reading Sidebar Panel */}
      <aside className="w-full md:w-96 h-1/3 md:h-full border-t md:border-t-0 md:border-l border-border-custom bg-card/30 backdrop-blur-md flex flex-col shrink-0 overflow-y-auto">
        <div className="p-5 flex flex-col gap-6">
          
          {/* Section 1: Progress Tracker Form */}
          <div className="bg-card border border-border-custom/50 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="font-serif font-bold text-xs flex items-center gap-2 text-foreground">
              <BookMarked className="w-4 h-4 text-accent-gold" />
              Reading Progress
            </h3>
            
            <form onSubmit={handleProgressUpdate} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-muted-custom tracking-wider block mb-1">
                    Current Page
                  </label>
                  <input
                    type="number"
                    value={currentPageInput}
                    onChange={(e) => setCurrentPageInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border-custom text-foreground font-semibold focus:outline-none focus:border-accent-gold"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-muted-custom tracking-wider block mb-1">
                    Total Pages
                  </label>
                  <div className="w-full px-3 py-2 text-xs rounded-xl bg-background/50 border border-border-custom text-muted-custom font-semibold select-none">
                    {activeBook.totalPages}
                  </div>
                </div>
              </div>

              {/* Progress visualizer bar */}
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-gold rounded-full transition-all duration-300"
                    style={{ width: `${activeBook.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-accent-gold">{activeBook.progress}%</span>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-accent-gold text-background rounded-xl text-xs font-bold border border-accent-gold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Progress Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Update Progress
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Section 2: Highlighter Clippings & Thought Pad Form */}
          <div className="bg-card border border-border-custom/50 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="font-serif font-bold text-xs flex items-center gap-2 text-foreground">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              Add Highlight clipping
            </h3>
            
            <form onSubmit={handleAddNote} className="flex flex-col gap-3">
              <div>
                <label className="text-[9px] uppercase font-bold text-muted-custom tracking-wider block mb-1">
                  Cliped/Highlighted Text
                </label>
                <textarea
                  placeholder="Paste or write key ebook quote passages here..."
                  value={highlightText}
                  onChange={(e) => setHighlightText(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-xl bg-background border border-border-custom text-foreground focus:outline-none focus:border-accent-gold leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-muted-custom tracking-wider block mb-1">
                  Personal Thought Notes (Optional)
                </label>
                <textarea
                  placeholder="Write your thought post-it comments..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-xl bg-background border border-border-custom text-foreground focus:outline-none focus:border-accent-gold leading-relaxed resize-none"
                />
              </div>

              {/* Color highlight choices */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-muted-custom tracking-wider">
                  Color marker:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedColor('turquoise')}
                    className={`w-5 h-5 rounded-full bg-teal-300 dark:bg-teal-400 border transition-transform ${selectedColor === 'turquoise' ? 'scale-125 border-foreground' : 'border-transparent'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedColor('pink')}
                    className={`w-5 h-5 rounded-full bg-pink-300 dark:bg-pink-400 border transition-transform ${selectedColor === 'pink' ? 'scale-125 border-foreground' : 'border-transparent'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedColor('gold')}
                    className={`w-5 h-5 rounded-full bg-amber-300 dark:bg-amber-400 border transition-transform ${selectedColor === 'gold' ? 'scale-125 border-foreground' : 'border-transparent'}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-foreground text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                {noteSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Note Clipped!
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" /> Save Note Clipping
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Section 3: Historical book highlights clippings */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif font-bold text-xs text-foreground px-0.5">
              Saved Clippings ({bookHighlights.length})
            </h3>
            
            {bookHighlights.length > 0 ? (
              <div className="flex flex-col gap-3">
                {bookHighlights.map((hl) => {
                  // Determine background coloring based on HSL color string
                  let markerBg = 'bg-teal-100/60 dark:bg-teal-950/40 border-teal-200/50 dark:border-teal-500/20';
                  let markerText = 'text-teal-950 dark:text-teal-300';
                  if (hl.color && hl.color.includes('327')) {
                    markerBg = 'bg-pink-100/60 dark:bg-pink-950/40 border-pink-200/50 dark:border-pink-500/20';
                    markerText = 'text-pink-950 dark:text-pink-300';
                  } else if (hl.color && hl.color.includes('45')) {
                    markerBg = 'bg-amber-100/60 dark:bg-amber-950/40 border-amber-200/50 dark:border-amber-500/20';
                    markerText = 'text-amber-950 dark:text-amber-300';
                  }
                  
                  return (
                    <div 
                      key={hl.id} 
                      className={`border p-3.5 rounded-2xl flex flex-col gap-2.5 shadow-sm leading-relaxed ${markerBg}`}
                    >
                      <p className={`text-xs italic font-serif ${markerText}`}>
                        "{hl.text}"
                      </p>
                      
                      {/* Thought Note overlay if present */}
                      {hl.note && hl.note !== hl.text && (
                        <div className="text-[10px] text-foreground/80 pt-2 border-t border-foreground/10 flex flex-col gap-1">
                          <span className="font-bold uppercase tracking-wider text-[8px] text-muted-custom">
                            Thought note:
                          </span>
                          <p>{hl.note}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[8px] text-muted-custom font-bold uppercase tracking-wider mt-0.5">
                        <span>Clipping Note</span>
                        <span>{hl.dateAdded}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-dashed border-border-custom rounded-2xl p-6 text-center select-none text-muted-custom">
                <p className="text-xs font-bold font-serif">No clippings saved yet</p>
                <p className="text-[10px] mt-0.5">Highlights and thoughts will compile here.</p>
              </div>
            )}
          </div>

        </div>
      </aside>
    </div>
  );
}
