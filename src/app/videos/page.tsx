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
  Video as VideoIcon
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';

function VideosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { videos, collections, updateVideoProgress, updateVideoRating, toggleVideoFavorite } = useLibrary();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<{ id: string } | null>(null);
  const [watchedMinInput, setWatchedMinInput] = useState('');
  const [totalMinInput, setTotalMinInput] = useState('');

  const activeVideo = videos.find(v => v.id === selectedVideo?.id) || null;

  // Sync details drawer input with active video current time & total duration (converted to minutes)
  useEffect(() => {
    if (activeVideo) {
      setWatchedMinInput((activeVideo.currentTime / 60).toFixed(2));
      setTotalMinInput((activeVideo.totalDuration / 60).toFixed(2));
    }
  }, [selectedVideo?.id, activeVideo?.currentTime, activeVideo?.totalDuration]);

  // Sync category param from homepage clicks
  useEffect(() => {
    const colParam = searchParams.get('collection');
    if (colParam && (colParam === 'all' || collections.some(c => c.slug === colParam))) {
      setSelectedCollection(colParam);
    }
  }, [searchParams, collections]);

  // Filter Logic
  const filteredVideos = videos.filter(vid => {
    // 1. Search Query Match
    const matchesSearch = vid.title.toLowerCase().includes(search.toLowerCase()) || 
                          vid.author.toLowerCase().includes(search.toLowerCase()) ||
                          vid.collection.toLowerCase().includes(search.toLowerCase());
    
    // 2. Status Match
    let matchesStatus = true;
    if (statusFilter === 'favorites') {
      matchesStatus = vid.isFavorite;
    } else if (statusFilter !== 'all') {
      matchesStatus = vid.status === statusFilter;
    }

    // 3. Collection/Category Match
    let matchesCollection = true;
    if (selectedCollection !== 'all') {
      matchesCollection = vid.collection.toLowerCase().replace(' ', '-') === selectedCollection;
    }

    return matchesSearch && matchesStatus && matchesCollection;
  });

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full relative">
      <header className="mb-8">
        <h1 className="text-sm font-medium text-muted-custom uppercase tracking-widest mb-1">
          Video lectures & guides
        </h1>
        <p className="font-handwritten text-4xl font-bold tracking-tight text-header-custom">
          Videos
        </p>
      </header>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-custom" />
        <input
          type="text"
          placeholder="Search by title, teacher, or keywords..."
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
            Watching Status
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
            {[
              { value: 'all', label: 'All Statuses' },
              { value: 'watching', label: 'Currently Watching' },
              { value: 'not_started', label: 'To Watch' },
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
            Video Categories
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

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-custom rounded-3xl p-6">
          <VideoIcon className="w-12 h-12 text-muted-custom mb-3 opacity-50" />
          <h3 className="font-serif text-lg font-bold">No videos found</h3>
          <p className="text-xs text-muted-custom max-w-xs mt-1">
            Try adjusting your category or status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredVideos.map((vid) => (
            <div 
              key={vid.id} 
              onClick={() => setSelectedVideo({ id: vid.id })}
              className="group cursor-pointer bg-card border border-border-custom rounded-3xl overflow-hidden shadow-sm hover:border-accent-gold/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Mock Thumbnail */}
              <div className={`aspect-video w-full flex items-center justify-center border-b border-border-custom relative overflow-hidden ${vid.thumbnailColor}`}>
                {vid.isFavorite && (
                  <div className="absolute top-2 right-2 text-accent-gold bg-black/60 p-1.5 rounded-full z-10">
                    <Star className="w-3.5 h-3.5 fill-accent-gold" />
                  </div>
                )}
                
                <div className="p-3 rounded-full bg-background/90 border border-border-custom text-accent-gold group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Play className="w-4 h-4 fill-accent-gold ml-0.5" />
                </div>
                
                <span className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white font-bold tracking-wider">
                  {vid.duration}
                </span>
              </div>

              {/* Video details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold text-accent-gold bg-accent-gold/10 px-2 py-0.5 rounded-full">
                    {vid.collection}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-foreground mt-2 line-clamp-1 group-hover:text-accent-gold transition-colors leading-snug">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-muted-custom truncate mt-0.5">
                    {vid.author}
                  </p>
                </div>

                <div className="w-full mt-4">
                  {vid.status === 'not_started' ? (
                    <span className="text-[9px] font-bold text-neutral-400 bg-neutral-800/10 px-2 py-0.5 rounded-full dark:bg-neutral-900 border border-border-custom uppercase tracking-wider">
                      Unwatched
                    </span>
                  ) : vid.status === 'completed' ? (
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase tracking-wider">
                      Completed
                    </span>
                  ) : (
                    <div>
                      <div className="flex justify-between text-[9px] text-muted-custom mb-1 font-semibold">
                        <span>{vid.progress}% Watched</span>
                        <span>{vid.duration}</span>
                      </div>
                      <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-gold rounded-full" 
                          style={{ width: `${vid.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Detail Drawer/Sidebar Panel */}
      {activeVideo && (
        <>
          <div 
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-card border-l border-border-custom p-6 md:p-8 flex flex-col justify-between z-40 shadow-2xl transition-transform animate-slide-in">
            <div className="overflow-y-auto pr-1 flex-1 pb-6">
              
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold bg-accent-gold/10 text-accent-gold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {activeVideo.collection} Collection
                </span>
                
                <div className="flex items-center">
                  {/* Favorite Toggle Button */}
                  <button 
                    onClick={() => toggleVideoFavorite(activeVideo.id)}
                    className="p-2 rounded-full hover:bg-foreground/5 text-muted-custom hover:text-accent-gold transition-all mr-1 cursor-pointer"
                    title={activeVideo.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Star className={`w-5 h-5 ${activeVideo.isFavorite ? 'text-accent-gold fill-accent-gold' : ''}`} />
                  </button>

                  <button 
                    onClick={() => setSelectedVideo(null)}
                    className="p-2 rounded-full hover:bg-foreground/5 text-muted-custom hover:text-foreground transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Core Details */}
              <div className="flex flex-col gap-4 mb-6">
                <div className={`aspect-video w-full rounded-2xl border flex items-center justify-center font-serif text-sm relative overflow-hidden ${activeVideo.thumbnailColor}`}>
                  <Play className="w-10 h-10 text-accent-gold fill-accent-gold/10 animate-pulse" />
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white font-bold">
                    {activeVideo.duration}
                  </span>
                </div>

                <div>
                  <h2 className="font-serif text-xl font-bold tracking-tight text-foreground leading-snug">
                    {activeVideo.title}
                  </h2>
                  <p className="text-sm text-muted-custom mt-1 mb-2">
                    by {activeVideo.author}
                  </p>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateVideoRating(activeVideo.id, star)}
                        className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star 
                          className={`w-3.5 h-3.5 ${
                            star <= activeVideo.rating 
                              ? 'text-accent-gold fill-accent-gold' 
                              : 'text-neutral-600 hover:text-accent-gold/50'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Watching Status controls */}
              <div className="mb-6 border-t border-b border-border-custom py-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-custom">Watching Status</span>
                  <span className="font-semibold flex items-center gap-1 capitalize text-foreground">
                    {activeVideo.status === 'watching' && <Play className="w-3.5 h-3.5 text-accent-gold fill-accent-gold/10" />}
                    {activeVideo.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {activeVideo.status === 'paused' && <PauseCircle className="w-3.5 h-3.5 text-amber-500" />}
                    {activeVideo.status === 'not_started' && <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />}
                    {activeVideo.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-custom">Playback Position</span>
                  <span className="font-semibold font-mono text-foreground">
                    {activeVideo.currentTime}m / {activeVideo.totalDuration}m ({activeVideo.progress}%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-custom">Synced Date</span>
                  <span className="font-semibold flex items-center gap-1 font-mono text-foreground">
                    <Clock className="w-3.5 h-3.5 text-muted-custom" /> {activeVideo.dateAdded}
                  </span>
                </div>
              </div>

              {/* Interactive manual progress input */}
              <div className="mb-6 bg-foreground/5 p-4 rounded-2xl border border-border-custom/50">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-custom mb-3">
                  Log Video Progress
                </h4>
                
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[9px] uppercase font-bold text-muted-custom tracking-wider block mb-1">
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
                      <label className="text-[9px] uppercase font-bold text-muted-custom tracking-wider block mb-1">
                        Total Video Minutes
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
                  
                  <button
                    onClick={() => {
                      const watchedSec = parseFloat(watchedMinInput) * 60;
                      const totalSec = parseFloat(totalMinInput) * 60;
                      if (isNaN(watchedSec) || isNaN(totalSec) || watchedSec < 0 || totalSec <= 0 || watchedSec > totalSec) {
                        alert('Please enter valid minutes (Watched Minutes must be less than or equal to Total Video Minutes).');
                        return;
                      }
                      updateVideoProgress(activeVideo.id, watchedSec, totalSec);
                    }}
                    className="w-full py-2.5 bg-accent-gold text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Save Progress
                  </button>
                </div>
              </div>

            </div>

            {/* Play Button */}
            <button
              onClick={() => router.push(`/videos/watch/${activeVideo.id}`)}
              className="w-full py-4 rounded-2xl bg-accent-gold text-background border border-accent-gold font-bold shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-300 shrink-0 cursor-pointer"
            >
              Play Video Lecture
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Videos() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-6 text-muted-custom font-serif text-sm">
        Loading videos...
      </div>
    }>
      <VideosContent />
    </Suspense>
  );
}
