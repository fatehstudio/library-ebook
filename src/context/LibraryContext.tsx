'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Collection {
  name: string;
  slug: string;
  color: string;
  count: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  progress: number;
  currentPage: number;
  totalPages: number;
  status: string;
  rating: number;
  isFavorite: boolean;
  collection: string;
  coverColor: string;
  description: string;
  dateAdded: string;
  googleDriveFileId?: string;
  coverImageUrl?: string | null;
}

export interface Video {
  id: string;
  title: string;
  author: string;
  duration: string;
  progress: number;
  currentTime: number;
  totalDuration: number;
  status: string;
  rating: number;
  isFavorite: boolean;
  collection: string;
  thumbnailColor: string;
  description: string;
  dateAdded: string;
  googleDriveFileId?: string;
  thumbnailUrl?: string | null;
}

export interface Highlight {
  id: string;
  text: string;
  source: string;
  author: string;
  collection: string;
  dateAdded: string;
  color?: string;
  note?: string;
}

export interface Dashboard {
  id: string;
  name: string;
  url: string;
  iconType: 'trading' | 'quran' | 'fateh' | 'ai' | 'generic';
  status: string;
  stats: { label: string; value: string }[];
}

interface LibraryContextType {
  collections: Collection[];
  books: Book[];
  videos: Video[];
  highlights: Highlight[];
  dashboards: Dashboard[];
  isCloudMode: boolean;
  isConnectedToDrive: boolean;
  isSyncing: boolean;
  addCollection: (name: string) => Promise<void>;
  deleteCollection: (slug: string) => Promise<void>;
  updateBookProgress: (id: string, page: number) => Promise<void>;
  updateBookRating: (id: string, rating: number) => Promise<void>;
  toggleBookFavorite: (id: string) => Promise<void>;
  updateVideoProgress: (id: string, time: number, duration?: number) => Promise<void>;
  updateVideoRating: (id: string, rating: number) => Promise<void>;
  toggleVideoFavorite: (id: string) => Promise<void>;
  addDashboard: (name: string, url: string) => Promise<void>;
  updateDashboard: (id: string, name: string, url: string) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  syncGoogleDrive: () => Promise<void>;
  addHighlight: (libraryItemId: string, text: string, note?: string, color?: string) => Promise<void>;
  updateHighlight: (id: string, text: string, note?: string) => Promise<void>;
  deleteHighlight: (id: string) => Promise<void>;
  updateItemCollection: (itemId: string, collectionName: string) => Promise<void>;
  updateBookCover: (id: string, url: string) => Promise<void>;
  updateVideoMetadata: (id: string, title: string, speaker: string, thumbnailUrl: string) => Promise<void>;
  searchPageContents: (query: string) => Promise<Array<{
    id: string;
    bookId: string;
    bookTitle: string;
    pageNumber: number;
    contentSnippet: string;
  }>>;
}

const DEFAULT_COLLECTIONS: Collection[] = [
  { name: 'Quran', slug: 'quran', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400', count: 3 },
  { name: 'Trading', slug: 'trading', color: 'border-blue-500/20 bg-blue-500/5 text-blue-400', count: 1 },
  { name: 'Fateh', slug: 'fateh', color: 'border-amber-500/20 bg-amber-500/5 text-amber-400', count: 0 },
  { name: 'AI', slug: 'ai', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400', count: 1 },
  { name: 'Self Development', slug: 'self-development', color: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400', count: 2 },
];

const DEFAULT_BOOKS: Book[] = [];

const DEFAULT_VIDEOS: Video[] = [];

const DEFAULT_HIGHLIGHTS: Highlight[] = [];

const DEFAULT_DASHBOARDS: Dashboard[] = [
  {
    id: 'trading',
    name: 'Trading Dashboard',
    url: 'https://trading-dashboard-omega.vercel.app',
    iconType: 'trading',
    status: 'ACTIVE',
    stats: [
      { label: 'Win Rate', value: '64.5%' },
      { label: 'Trades Today', value: '4' },
      { label: 'Profit Target', value: 'Reached' }
    ]
  },
  {
    id: 'quran',
    name: 'Quran Dashboard',
    url: 'https://quran-dashboard-gamma.vercel.app',
    iconType: 'quran',
    status: 'ACTIVE',
    stats: [
      { label: 'Hifz Memorized', value: '4 Juz' },
      { label: 'Today\'s Revision', value: '5 Pages' },
      { label: 'Streak', value: '18 Days' }
    ]
  },
  {
    id: 'fateh',
    name: 'Fateh Task Dashboard',
    url: 'https://fateh-tasks.vercel.app',
    iconType: 'fateh',
    status: '12 TODO',
    stats: [
      { label: 'Tasks Done Today', value: '8' },
      { label: 'Focus Score', value: '92%' },
      { label: 'Next Meeting', value: '2:30 PM' }
    ]
  },
  {
    id: 'ai',
    name: 'AI Dashboard',
    url: 'https://ai-dashboard-beta.vercel.app',
    iconType: 'ai',
    status: 'ACTIVE',
    stats: [
      { label: 'Tokens Used', value: '14.2k' },
      { label: 'Models Active', value: 'Gemini Pro' },
      { label: 'Agent status', value: 'Idle' }
    ]
  }
];

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  
  // Integration States
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [isConnectedToDrive, setIsConnectedToDrive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const userId = '00000000-0000-0000-0000-000000000000'; // Static UUID key for single-user home system configuration

  // Reload library catalog files from Supabase (shared action)
  const loadDatabaseData = async () => {
    try {
      // 1. Check if Supabase URL is placeholder
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      if (!supabaseUrl || supabaseUrl.startsWith('your_') || supabaseUrl.includes('placeholder')) {
        setIsCloudMode(false);
        return false;
      }

      // Check Google OAuth connection status
      const { data: profile } = await supabase
        .from('profiles')
        .select('google_refresh_token')
        .eq('id', userId)
        .single();

      if (profile && profile.google_refresh_token) {
        setIsConnectedToDrive(true);
      }

      setIsCloudMode(true);

      // Load collections
      const { data: dbCols } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId);

      if (dbCols && dbCols.length > 0) {
        setCollections(dbCols.map(c => ({
          name: c.name,
          slug: c.slug,
          color: c.color || 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400',
          count: 0
        })));
      } else {
        // Seed default collections if empty in DB
        for (const col of DEFAULT_COLLECTIONS) {
          await supabase.from('collections').insert({
            user_id: userId,
            name: col.name,
            slug: col.slug,
            color: col.color
          });
        }
        setCollections(DEFAULT_COLLECTIONS);
      }

      // Load library items (Books & Videos)
      const { data: dbItems } = await supabase
        .from('library_items')
        .select('*')
        .eq('user_id', userId);

      // Load custom item-collection mappings
      const { data: dbMappings } = await supabase
        .from('library_item_collections')
        .select('library_item_id, collections(name)');

      const mappedBooks: Book[] = [];
      const mappedVids: Video[] = [];

      const getMappedCollection = (itemId: string, defaultCollection: string) => {
        if (!dbMappings || dbMappings.length === 0) return defaultCollection;
        const match = dbMappings.find((m: any) => m.library_item_id === itemId);
        if (match && match.collections) {
          return (match.collections as any).name || defaultCollection;
        }
        return defaultCollection;
      };

      if (dbItems && dbItems.length > 0) {
        dbItems.forEach(item => {
          const resolvedCategory = getMappedCollection(item.id, item.type === 'ebook' ? 'Self Development' : 'Quran');

          if (item.type === 'ebook') {
            mappedBooks.push({
              id: item.id,
              title: item.title,
              author: item.author || 'Google Drive File',
              progress: Math.round(item.progress_percent || 0),
              currentPage: item.current_page || 0,
              totalPages: item.total_pages || 300,
              status: item.status || 'not_started',
              rating: item.rating || 0,
              isFavorite: item.is_favorite || false,
              collection: resolvedCategory,
              coverColor: 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400',
              description: item.description || '',
              dateAdded: new Date(item.created_at).toISOString().split('T')[0],
              googleDriveFileId: item.google_drive_file_id,
              coverImageUrl: item.cover_image_url || null
            });
          } else {
            mappedVids.push({
              id: item.id,
              title: item.title,
              author: item.author || 'Drive Sync Video',
              duration: item.total_duration ? `${Math.floor(item.total_duration / 60)}:00` : '15:00',
              progress: Math.round(item.progress_percent || 0),
              currentTime: item.current_time || 0,
              totalDuration: item.total_duration || 900,
              status: item.status === 'completed' ? 'completed' : 'watching',
              rating: item.rating || 0,
              isFavorite: item.is_favorite || false,
              collection: resolvedCategory,
              thumbnailColor: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400',
              description: item.description || '',
              dateAdded: new Date(item.created_at).toISOString().split('T')[0],
              googleDriveFileId: item.google_drive_file_id,
              thumbnailUrl: item.cover_image_url || null
            });
          }
        });

        setBooks(mappedBooks);
        setVideos(mappedVids);

        // Update collection item counts
        setCollections(prev => prev.map(c => {
          const bCount = mappedBooks.filter(b => b.collection.toLowerCase().trim() === c.name.toLowerCase().trim()).length;
          const vCount = mappedVids.filter(v => v.collection.toLowerCase().trim() === c.name.toLowerCase().trim()).length;
          return { ...c, count: bCount + vCount };
        }));
      } else {
        // Seed default items into library if empty in DB
        for (const book of DEFAULT_BOOKS) {
          await supabase.from('library_items').insert({
            user_id: userId,
            title: book.title,
            author: book.author,
            type: 'ebook',
            status: book.status,
            progress_percent: book.progress,
            current_page: book.currentPage,
            total_pages: book.totalPages,
            rating: book.rating,
            is_favorite: book.isFavorite,
            description: book.description,
            google_drive_file_id: `mock-${book.id}`
          });
        }

        for (const vid of DEFAULT_VIDEOS) {
          await supabase.from('library_items').insert({
            user_id: userId,
            title: vid.title,
            author: vid.author,
            type: 'video',
            status: vid.status,
            progress_percent: vid.progress,
            current_time: vid.currentTime,
            total_duration: vid.totalDuration * 60, // store seconds
            rating: vid.rating,
            is_favorite: vid.isFavorite,
            description: vid.description,
            google_drive_file_id: `mock-${vid.id}`
          });
        }
        setBooks(DEFAULT_BOOKS);
        setVideos(DEFAULT_VIDEOS);
      }

      // Load Highlights
      const { data: dbHighlights } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', userId);

      if (dbHighlights && dbHighlights.length > 0) {
        setHighlights(dbHighlights.map(h => {
          const matchedBook = mappedBooks.find(b => b.id === h.library_item_id) || DEFAULT_BOOKS.find(b => b.id === h.library_item_id);
          const matchedVid = mappedVids.find(v => v.id === h.library_item_id) || DEFAULT_VIDEOS.find(v => v.id === h.library_item_id);
          const sourceTitle = matchedBook?.title || matchedVid?.title || 'Library Item Highlight';
          const sourceAuthor = matchedBook?.author || matchedVid?.author || 'Highlight User';
          const sourceCollection = matchedBook?.collection || matchedVid?.collection || 'Self Development';
          
          return {
            id: h.id,
            text: h.text,
            source: sourceTitle,
            author: sourceAuthor,
            collection: sourceCollection,
            dateAdded: new Date(h.created_at).toISOString().split('T')[0],
            color: h.color,
            note: h.note
          };
        }));
      } else {
        // Seed default highlights
        for (const h of DEFAULT_HIGHLIGHTS) {
          await supabase.from('highlights').insert({
            user_id: userId,
            text: h.text,
            note: h.text
          });
        }
        setHighlights(DEFAULT_HIGHLIGHTS);
      }

      // Set dashboards from localStorage fallback
      const savedDashboards = localStorage.getItem('kb-dashboards');
      if (savedDashboards) {
        try { setDashboards(JSON.parse(savedDashboards)); } catch (e) { setDashboards(DEFAULT_DASHBOARDS); }
      } else {
        setDashboards(DEFAULT_DASHBOARDS);
      }

      return true;
    } catch (err) {
      console.warn('Supabase DB connection failed. Falling back to local state.', err);
      setIsCloudMode(false);
      return false;
    }
  };

  // Initial Load Trigger
  useEffect(() => {
    loadDatabaseData().then(success => {
      if (!success) {
        // Fallback local loading
        const savedCols = localStorage.getItem('kb-collections');
        setCollections(savedCols ? JSON.parse(savedCols) : DEFAULT_COLLECTIONS);
        
        const savedBooks = localStorage.getItem('kb-books');
        setBooks(savedBooks ? JSON.parse(savedBooks) : DEFAULT_BOOKS);
        
        const savedVids = localStorage.getItem('kb-videos');
        setVideos(savedVids ? JSON.parse(savedVids) : DEFAULT_VIDEOS);
        
        const savedHighlights = localStorage.getItem('kb-highlights');
        setHighlights(savedHighlights ? JSON.parse(savedHighlights) : DEFAULT_HIGHLIGHTS);

        const savedDashboards = localStorage.getItem('kb-dashboards');
        setDashboards(savedDashboards ? JSON.parse(savedDashboards) : DEFAULT_DASHBOARDS);
      }
    });
  }, []);

  const addCollection = async (name: string) => {
    const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) return;
    if (collections.some(c => c.slug === slug)) {
      alert('A category with this name already exists.');
      return;
    }
    const borderColors = ['border-pink-500/20 bg-pink-500/5 text-pink-400', 'border-rose-500/20 bg-rose-500/5 text-rose-400', 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400', 'border-orange-500/20 bg-orange-500/5 text-orange-400', 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400'];
    const randomColor = borderColors[Math.floor(Math.random() * borderColors.length)];
    const newCol: Collection = { name, slug, color: randomColor, count: 0 };
    
    const updated = [...collections, newCol];
    setCollections(updated);
    localStorage.setItem('kb-collections', JSON.stringify(updated));

    if (isCloudMode) {
      await supabase.from('collections').insert({
        user_id: userId,
        name,
        slug,
        color: randomColor
      });
    }
  };

  const deleteCollection = async (slug: string) => {
    const updated = collections.filter(c => c.slug !== slug);
    setCollections(updated);
    localStorage.setItem('kb-collections', JSON.stringify(updated));

    if (isCloudMode) {
      await supabase.from('collections').delete().eq('user_id', userId).eq('slug', slug);
    }
  };

  const updateBookProgress = async (id: string, page: number) => {
    const updatedBooks = books.map(book => {
      if (book.id !== id) return book;
      const validatedPage = Math.max(0, Math.min(page, book.totalPages));
      const percentage = Math.round((validatedPage / book.totalPages) * 100);
      const status = validatedPage === 0 ? 'not_started' : validatedPage === book.totalPages ? 'completed' : 'reading';
      return { ...book, currentPage: validatedPage, progress: percentage, status };
    });
    setBooks(updatedBooks);
    localStorage.setItem('kb-books', JSON.stringify(updatedBooks));

    if (isCloudMode) {
      const targetBook = books.find(b => b.id === id);
      if (targetBook) {
        const validatedPage = Math.max(0, Math.min(page, targetBook.totalPages));
        const percentage = Math.round((validatedPage / targetBook.totalPages) * 100);
        const status = validatedPage === 0 ? 'not_started' : validatedPage === targetBook.totalPages ? 'completed' : 'reading';
        
        await supabase
          .from('library_items')
          .update({
            current_page: validatedPage,
            progress_percent: percentage,
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('id', id);
      }
    }
  };

  const updateBookRating = async (id: string, rating: number) => {
    const updatedBooks = books.map(book => {
      if (book.id !== id) return book;
      return { ...book, rating: Math.max(1, Math.min(5, rating)) };
    });
    setBooks(updatedBooks);
    localStorage.setItem('kb-books', JSON.stringify(updatedBooks));

    if (isCloudMode) {
      await supabase
        .from('library_items')
        .update({ rating: Math.max(1, Math.min(5, rating)), updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('id', id);
    }
  };

  const toggleBookFavorite = async (id: string) => {
    let nextFav = false;
    const updatedBooks = books.map(book => {
      if (book.id !== id) return book;
      nextFav = !book.isFavorite;
      return { ...book, isFavorite: nextFav };
    });
    setBooks(updatedBooks);
    localStorage.setItem('kb-books', JSON.stringify(updatedBooks));

    if (isCloudMode) {
      await supabase
        .from('library_items')
        .update({ is_favorite: nextFav, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('id', id);
    }
  };

  const updateVideoProgress = async (id: string, time: number, duration?: number) => {
    const updatedVids = videos.map(vid => {
      if (vid.id !== id) return vid;
      const targetDuration = duration !== undefined ? duration : vid.totalDuration;
      const validatedTime = Math.max(0, Math.min(time, targetDuration));
      const percentage = targetDuration > 0 ? Math.round((validatedTime / targetDuration) * 100) : 0;
      const status = validatedTime === 0 ? 'not_started' : validatedTime === targetDuration ? 'completed' : 'watching';
      const formattedMin = Math.floor(targetDuration / 60);
      const formattedSec = Math.floor(targetDuration % 60);
      const durationStr = `${formattedMin}:${formattedSec < 10 ? '0' : ''}${formattedSec}`;
      return { 
        ...vid, 
        currentTime: validatedTime, 
        totalDuration: targetDuration, 
        duration: durationStr, 
        progress: percentage, 
        status 
      };
    });
    setVideos(updatedVids);
    localStorage.setItem('kb-videos', JSON.stringify(updatedVids));

    if (isCloudMode) {
      const targetVid = videos.find(v => v.id === id);
      if (targetVid) {
        const targetDuration = duration !== undefined ? duration : targetVid.totalDuration;
        const validatedTime = Math.max(0, Math.min(time, targetDuration));
        const percentage = targetDuration > 0 ? Math.round((validatedTime / targetDuration) * 100) : 0;
        const status = validatedTime === 0 ? 'not_started' : validatedTime === targetDuration ? 'completed' : 'watching';
        
        await supabase
          .from('library_items')
          .update({
            current_time: validatedTime,
            total_duration: targetDuration,
            progress_percent: percentage,
            status: status === 'completed' ? 'completed' : 'reading',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('id', id);
      }
    }
  };

  const updateVideoRating = async (id: string, rating: number) => {
    const updatedVids = videos.map(vid => {
      if (vid.id !== id) return vid;
      return { ...vid, rating: Math.max(1, Math.min(5, rating)) };
    });
    setVideos(updatedVids);
    localStorage.setItem('kb-videos', JSON.stringify(updatedVids));

    if (isCloudMode) {
      await supabase
        .from('library_items')
        .update({ rating: Math.max(1, Math.min(5, rating)), updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('id', id);
    }
  };

  const toggleVideoFavorite = async (id: string) => {
    let nextFav = false;
    const updatedVids = videos.map(vid => {
      if (vid.id !== id) return vid;
      nextFav = !vid.isFavorite;
      return { ...vid, isFavorite: nextFav };
    });
    setVideos(updatedVids);
    localStorage.setItem('kb-videos', JSON.stringify(updatedVids));

    if (isCloudMode) {
      await supabase
        .from('library_items')
        .update({ is_favorite: nextFav, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('id', id);
    }
  };

  const addDashboard = async (name: string, url: string) => {
    const id = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!id) return;
    if (dashboards.some(d => d.id === id)) {
      alert('A dashboard with this name already exists.');
      return;
    }

    let urlFormatted = url.trim();
    if (!urlFormatted.startsWith('http://') && !urlFormatted.startsWith('https://')) {
      urlFormatted = 'https://' + urlFormatted;
    }

    const newDash: Dashboard = {
      id,
      name,
      url: urlFormatted,
      iconType: 'generic',
      status: 'LINKED',
      stats: [
        { label: 'Type', value: 'Custom Link' },
        { label: 'Status', value: 'Healthy' }
      ]
    };

    const updated = [...dashboards, newDash];
    setDashboards(updated);
    localStorage.setItem('kb-dashboards', JSON.stringify(updated));
  };

  const updateDashboard = async (id: string, name: string, url: string) => {
    let urlFormatted = url.trim();
    if (!urlFormatted.startsWith('http://') && !urlFormatted.startsWith('https://')) {
      urlFormatted = 'https://' + urlFormatted;
    }

    const updated = dashboards.map(d => {
      if (d.id !== id) return d;
      return { ...d, name, url: urlFormatted };
    });
    setDashboards(updated);
    localStorage.setItem('kb-dashboards', JSON.stringify(updated));
  };

  const deleteDashboard = async (id: string) => {
    const updated = dashboards.filter(d => d.id !== id);
    setDashboards(updated);
    localStorage.setItem('kb-dashboards', JSON.stringify(updated));
  };

  const syncGoogleDrive = async () => {
    setIsSyncing(true);
    try {
      const resp = await fetch(`/api/sync?userId=${userId}`, { method: 'POST' });
      if (!resp.ok) {
        const text = await resp.text();
        let errMsg = 'Unknown error';
        try {
          const parsed = JSON.parse(text);
          errMsg = parsed.error || errMsg;
        } catch {
          if (text.includes('504') || text.includes('timeout') || text.includes('Timeout') || text.includes('Gate-way')) {
            errMsg = 'Execution timeout on Vercel Hobby tier (took longer than 10 seconds). Try clicking Sync again to resume next file!';
          } else {
            errMsg = text.substring(0, 120);
          }
        }
        alert(`Google Drive Sync Failed: ${errMsg}`);
        return;
      }
      const data = await resp.json();
      alert(`Sync Complete! Discovered ${data.filesDiscovered} files under /Knowledge Library folder, synced ${data.filesSynced} items.`);
      await loadDatabaseData(); // Reload catalog from DB
    } catch (err: any) {
      alert(`Google Drive Sync Error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const addHighlight = async (libraryItemId: string, text: string, note?: string, color?: string) => {
    const targetBook = books.find(b => b.id === libraryItemId);
    const targetVid = videos.find(v => v.id === libraryItemId);
    const title = targetBook?.title || targetVid?.title || 'Unknown Source';
    const author = targetBook?.author || targetVid?.author || 'Unknown Author';
    const collection = targetBook?.collection || targetVid?.collection || 'General';

    const newHighlight: Highlight = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      text,
      source: title,
      author,
      collection,
      dateAdded: new Date().toISOString().split('T')[0],
      note,
      color: color || 'hsl(45, 100%, 75%)'
    };

    const updated = [newHighlight, ...highlights];
    setHighlights(updated);
    localStorage.setItem('kb-highlights', JSON.stringify(updated));

    if (isCloudMode) {
      await supabase.from('highlights').insert({
        id: newHighlight.id,
        user_id: userId,
        library_item_id: libraryItemId,
        text,
        note,
        color: color || 'hsl(45, 100%, 75%)'
      });
    }
  };

  const updateHighlight = async (id: string, text: string, note?: string) => {
    const updated = highlights.map(h => h.id === id ? { ...h, text, note } : h);
    setHighlights(updated);
    localStorage.setItem('kb-highlights', JSON.stringify(updated));

    if (isCloudMode) {
      try {
        await supabase
          .from('highlights')
          .update({
            text,
            note,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.error('Failed to update highlight in DB:', err);
      }
    }
  };

  const deleteHighlight = async (id: string) => {
    const updated = highlights.filter(h => h.id !== id);
    setHighlights(updated);
    localStorage.setItem('kb-highlights', JSON.stringify(updated));

    if (isCloudMode) {
      try {
        await supabase
          .from('highlights')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.error('Failed to delete highlight from DB:', err);
      }
    }
  };

  const updateItemCollection = async (itemId: string, collectionName: string) => {
    const updatedBooks = books.map(b => b.id === itemId ? { ...b, collection: collectionName } : b);
    const updatedVids = videos.map(v => v.id === itemId ? { ...v, collection: collectionName } : v);
    setBooks(updatedBooks);
    setVideos(updatedVids);
    localStorage.setItem('kb-books', JSON.stringify(updatedBooks));
    localStorage.setItem('kb-videos', JSON.stringify(updatedVids));

    // Update counts dynamically
    setCollections(prev => prev.map(c => {
      const bCount = updatedBooks.filter(b => b.collection.toLowerCase().trim() === c.name.toLowerCase().trim()).length;
      const vCount = updatedVids.filter(v => v.collection.toLowerCase().trim() === c.name.toLowerCase().trim()).length;
      return { ...c, count: bCount + vCount };
    }));

    if (isCloudMode) {
      try {
        const slug = collectionName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const { data: colData } = await supabase
          .from('collections')
          .select('id')
          .eq('user_id', userId)
          .eq('slug', slug)
          .single();

        if (colData) {
          // Delete old mapping if exists
          await supabase
            .from('library_item_collections')
            .delete()
            .eq('library_item_id', itemId);

          // Insert new mapping
          await supabase
            .from('library_item_collections')
            .insert({
              library_item_id: itemId,
              collection_id: colData.id
            });
        }
      } catch (err) {
        console.error('Failed to update library item collection in DB:', err);
      }
    }
  };

  const updateBookCover = async (id: string, url: string) => {
    const updatedBooks = books.map(b => b.id === id ? { ...b, coverImageUrl: url } : b);
    setBooks(updatedBooks);
    localStorage.setItem('kb-books', JSON.stringify(updatedBooks));

    if (isCloudMode) {
      try {
        await supabase
          .from('library_items')
          .update({
            cover_image_url: url || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('id', id);
      } catch (err) {
        console.error('Failed to update book cover in DB:', err);
      }
    }
  };

  const searchPageContents = async (query: string) => {
    if (!query || !isCloudMode) return [];

    try {
      const { data, error } = await supabase
        .from('pdf_pages')
        .select(`
          id,
          page_number,
          content,
          library_items (
            id,
            title
          )
        `)
        .textSearch('fts', query, {
          type: 'websearch',
          config: 'simple'
        })
        .limit(15);

      if (error) {
        console.error('FTS query failed:', error);
        throw new Error(error.message || 'Database query error');
      }

      if (!data) return [];

      return data.map((row: any) => {
        const content = row.content || '';
        const cleanQuery = query.toLowerCase();
        const idx = content.toLowerCase().indexOf(cleanQuery);
        
        let contentSnippet = '';
        if (idx !== -1) {
          contentSnippet = '...' + content.substring(Math.max(0, idx - 60), Math.min(content.length, idx + 90)) + '...';
        } else {
          contentSnippet = content.substring(0, 150) + '...';
        }

        return {
          id: row.id,
          bookId: row.library_items?.id || '',
          bookTitle: row.library_items?.title || 'Unknown Book',
          pageNumber: row.page_number,
          contentSnippet: contentSnippet
        };
      });
    } catch (err) {
      console.error('Failed to search page contents:', err);
      return [];
    }
  };

  const updateVideoMetadata = async (id: string, title: string, speaker: string, thumbnailUrl: string) => {
    const updatedVids = videos.map(v => v.id === id ? { ...v, title, author: speaker, thumbnailUrl } : v);
    setVideos(updatedVids);
    localStorage.setItem('kb-videos', JSON.stringify(updatedVids));

    if (isCloudMode) {
      try {
        await supabase
          .from('library_items')
          .update({
            title,
            author: speaker || null,
            cover_image_url: thumbnailUrl || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('id', id);
      } catch (err) {
        console.error('Failed to update video metadata in DB:', err);
      }
    }
  };

  return (
    <LibraryContext.Provider value={{ 
      collections, 
      books,
      videos,
      highlights,
      dashboards,
      isCloudMode,
      isConnectedToDrive,
      isSyncing,
      addCollection, 
      deleteCollection, 
      updateBookProgress,
      updateBookRating,
      toggleBookFavorite,
      updateVideoProgress,
      updateVideoRating,
      toggleVideoFavorite,
      addDashboard,
      updateDashboard,
      deleteDashboard,
      syncGoogleDrive,
      addHighlight,
      updateHighlight,
      deleteHighlight,
      updateItemCollection,
      updateBookCover,
      updateVideoMetadata,
      searchPageContents
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
