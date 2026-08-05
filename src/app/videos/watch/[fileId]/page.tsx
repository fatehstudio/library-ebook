'use client';

import React, { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Star,
  CheckCircle2,
  Bookmark,
  Save,
  Sparkles,
  FileText,
  Video as VideoIcon
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';

export default function WatchVideo({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = use(params);
  const router = useRouter();
  const { videos, highlights, updateVideoProgress, updateVideoRating, addHighlight } = useLibrary();

  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  
  // Progress tracker states
  const [watchedMinInput, setWatchedMinInput] = useState<string>('');
  const [totalMinInput, setTotalMinInput] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Highlighter notes states
  const [highlightText, setHighlightText] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('turquoise');
  const [noteSuccess, setNoteSuccess] = useState<boolean>(false);
  const [ratingSuccess, setRatingSuccess] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const activeVideoRef = useRef<any>(null);

  // Keep ref in sync with latest activeVideo state
  useEffect(() => {
    activeVideoRef.current = activeVideo;
  }, [activeVideo]);

  useEffect(() => {
    const video = videos.find(v => v.id === fileId);
    if (video) {
      setActiveVideo(video);
      // Sync minutes to input boxes
      setWatchedMinInput((video.currentTime / 60).toFixed(2));
      setTotalMinInput((video.totalDuration / 60).toFixed(2));
    }
  }, [videos, fileId]);

  // Auto-resume bookmark tracking on metadata load
  const handleLoadedMetadata = () => {
    const videoElement = videoRef.current;
    if (videoElement && activeVideo) {
      const actualDuration = Math.round(videoElement.duration);
      const savedTime = activeVideo.currentTime || 0;
      
      // Update DB with true duration if it differs from current stored duration
      if (actualDuration > 0 && actualDuration !== activeVideo.totalDuration) {
        updateVideoProgress(activeVideo.id, savedTime, actualDuration);
        setTotalMinInput((actualDuration / 60).toFixed(2));
      }

      if (savedTime > 2) { // Only resume if they watched more than 2 seconds
        videoElement.currentTime = savedTime;
        lastSavedTimeRef.current = savedTime;
        
        // Format time for user display
        const minutes = Math.floor(savedTime / 60);
        const seconds = Math.floor(savedTime % 60);
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        setToastMessage(`Resumed playback from ${formattedTime}`);
        setTimeout(() => setToastMessage(''), 3500);
      }
    }
  };

  // Auto-save progress tracker on pause and throttled playback time updates
  const handleTimeUpdate = async () => {
    const videoElement = videoRef.current;
    if (!videoElement || !activeVideo) return;

    const currentTime = videoElement.currentTime;
    const diff = Math.abs(currentTime - lastSavedTimeRef.current);

    // Sync input box as they watch
    setWatchedMinInput((currentTime / 60).toFixed(2));

    // Auto-save every 10 seconds of playback duration progress change
    if (diff >= 10) {
      lastSavedTimeRef.current = currentTime;
      await updateVideoProgress(activeVideo.id, currentTime);
    }
  };

  const handlePlayPauseSave = async () => {
    const videoElement = videoRef.current;
    if (!videoElement || !activeVideo) return;
    
    // Save bookmark instantly on pause event
    if (videoElement.paused) {
      const currentTime = videoElement.currentTime;
      lastSavedTimeRef.current = currentTime;
      await updateVideoProgress(activeVideo.id, currentTime);
    }
  };

  // Save progress when user navigates away or component unmounts
  useEffect(() => {
    return () => {
      const videoElement = videoRef.current;
      const latestVid = activeVideoRef.current;
      if (videoElement && latestVid) {
        const currentTime = videoElement.currentTime;
        updateVideoProgress(latestVid.id, currentTime);
      }
    };
  }, []);

  if (!activeVideo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted-custom font-serif text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-gold mb-3" />
        Loading video stream details...
      </div>
    );
  }

  // Get stream source URL
  const streamUrl = activeVideo.googleDriveFileId 
    ? `/api/library/stream/${activeVideo.googleDriveFileId}`
    : '';

  // Filter highlights related to this video title
  const videoHighlights = highlights.filter(h => 
    h.source.toLowerCase().trim() === activeVideo.title.toLowerCase().trim()
  );

  const handleProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const watchedSec = parseFloat(watchedMinInput) * 60;
    const totalSec = parseFloat(totalMinInput) * 60;
    
    if (isNaN(watchedSec) || isNaN(totalSec) || watchedSec < 0 || totalSec <= 0 || watchedSec > totalSec) {
      alert('Please enter valid minutes (Watched Minutes must be less than or equal to Total Video Minutes).');
      return;
    }

    // Update video element current playback position if they modified it manually
    if (videoRef.current) {
      videoRef.current.currentTime = watchedSec;
    }
    
    await updateVideoProgress(activeVideo.id, watchedSec, totalSec);
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

    await addHighlight(activeVideo.id, highlightText.trim(), noteText.trim(), colorHsl);
    setHighlightText('');
    setNoteText('');
    setNoteSuccess(true);
    setTimeout(() => setNoteSuccess(false), 2000);
  };

  const handleRating = async (r: number) => {
    await updateVideoRating(activeVideo.id, r);
    setRatingSuccess(true);
    setTimeout(() => setRatingSuccess(false), 2000);
  };

  return (
    <div className="flex-1 h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left side: Centered Video Player Theater Frame */}
      <div className="flex-1 h-2/3 md:h-full p-4 flex flex-col">
        {/* Navigation & Header */}
        <header className="flex items-center justify-between mb-3 px-1 shrink-0">
          <div className="flex items-center gap-3">
            <Link 
              href="/videos" 
              className="p-2 border border-border-custom/50 rounded-xl bg-card hover:bg-foreground/5 text-muted-custom hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-serif font-bold text-sm md:text-base text-foreground line-clamp-1 max-w-md">
                {activeVideo.title}
              </h1>
              <p className="text-[10px] text-muted-custom">uploaded by {activeVideo.author}</p>
            </div>
          </div>
          
          <div className="text-[10px] font-bold text-accent-gold bg-accent-gold/10 px-2.5 py-1 rounded-full border border-accent-gold/25 uppercase tracking-wider">
            {activeVideo.progress}% Synced
          </div>
        </header>

        {/* Video Player wrapper (fills space) */}
        <div className="flex-1 rounded-3xl overflow-hidden border border-border-custom bg-black relative flex items-center justify-center shadow-md">
          {streamUrl ? (
            <video
              ref={videoRef}
              src={streamUrl}
              controls
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPause={handlePlayPauseSave}
              className="w-full h-full max-h-[78vh] object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-muted-custom select-none">
              <Clock className="w-12 h-12 text-muted-custom mb-3 opacity-30 animate-pulse" />
              <p className="font-serif text-sm font-bold">Video stream not available</p>
              <p className="text-xs mt-1 max-w-xs">Verify this file is synced properly from Google Drive.</p>
            </div>
          )}

          {/* Dynamic Toast for Bookmarks */}
          {toastMessage && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/85 border border-accent-gold/40 text-accent-gold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xl backdrop-blur-md animate-slide-in font-serif">
              <Clock className="w-4 h-4" />
              {toastMessage}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Kindle-style Watch Sidebar Panel */}
      <aside className="w-full md:w-96 h-1/3 md:h-full border-t md:border-t-0 md:border-l border-border-custom bg-card/30 backdrop-blur-md flex flex-col shrink-0 overflow-y-auto">
        <div className="p-5 flex flex-col gap-6">
          
          {/* Section 1: Watch Progress Tracker Form */}
          <div className="bg-card border border-border-custom/50 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="font-serif font-bold text-xs flex items-center gap-2 text-foreground">
              <Bookmark className="w-4 h-4 text-accent-gold" />
              Watch Progress
            </h3>
            
            <form onSubmit={handleProgressUpdate} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-muted-custom tracking-wider block mb-1">
                    Minutes Watched
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={watchedMinInput}
                    onChange={(e) => setWatchedMinInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border-custom text-foreground font-semibold focus:outline-none focus:border-accent-gold"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-bold text-muted-custom tracking-wider block mb-1">
                    Total Minutes
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={totalMinInput}
                    onChange={(e) => setTotalMinInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border-custom text-foreground font-semibold focus:outline-none focus:border-accent-gold"
                  />
                </div>
              </div>

              {/* Progress visualizer bar */}
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-gold rounded-full transition-all duration-300"
                    style={{ width: `${activeVideo.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-accent-gold">{activeVideo.progress}%</span>
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

          {/* Rating Widget */}
          <div className="bg-card border border-border-custom/50 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="font-serif font-bold text-xs flex items-center gap-2 text-foreground">
              <Star className="w-4 h-4 text-accent-gold" />
              Video Review
            </h3>
            
            <div className="flex items-center gap-1.5 my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star 
                    className={`w-5.5 h-5.5 ${
                      star <= activeVideo.rating 
                        ? 'text-accent-gold fill-accent-gold' 
                        : 'text-muted-custom hover:text-accent-gold/60'
                    }`} 
                  />
                </button>
              ))}
            </div>

            <p className="text-[10px] text-muted-custom leading-relaxed">
              {ratingSuccess ? (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Review synchronized!
                </span>
              ) : (
                'Assign stars to record review rankings in your remote cloud database.'
              )}
            </p>
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
                  Clipped/Highlighted Quote
                </label>
                <textarea
                  placeholder="Paste or write key video quote passages here..."
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

          {/* Section 3: Historical video highlights clippings */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif font-bold text-xs text-foreground px-0.5">
              Saved Clippings ({videoHighlights.length})
            </h3>
            
            {videoHighlights.length > 0 ? (
              <div className="flex flex-col gap-3">
                {videoHighlights.map((hl) => {
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
