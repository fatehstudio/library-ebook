-- 1. Profiles (User Info & Sync Configuration)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    google_drive_folder_id TEXT, -- ID of the root "Knowledge Library" folder
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Collections (Custom Categories)
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT 'hsl(36, 42%, 48%)', -- Sepia accent by default
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

-- 3. Library Items (Ebooks & Videos synced from Google Drive)
CREATE TABLE IF NOT EXISTS public.library_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    type TEXT CHECK (type IN ('ebook', 'video')) NOT NULL,
    google_drive_file_id TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT,
    cover_image_url TEXT,
    status TEXT CHECK (status IN ('not_started', 'reading', 'paused', 'completed')) DEFAULT 'not_started',
    progress_percent NUMERIC DEFAULT 0.0 CHECK (progress_percent BETWEEN 0 AND 100),
    current_page INTEGER DEFAULT 0,
    total_pages INTEGER DEFAULT 0,
    "current_time" NUMERIC DEFAULT 0.0, -- for videos (seconds)
    total_duration NUMERIC DEFAULT 0.0, -- for videos (seconds)
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    is_favorite BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, google_drive_file_id)
);

-- 4. Library Item - Collection Mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.library_item_collections (
    library_item_id UUID REFERENCES public.library_items(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    PRIMARY KEY (library_item_id, collection_id)
);

-- 5. Highlights & Notes (Text annotations in ebooks/videos)
CREATE TABLE IF NOT EXISTS public.highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    library_item_id UUID REFERENCES public.library_items(id) ON DELETE CASCADE,
    text TEXT NOT NULL, -- The highlighted text
    note TEXT, -- Personal note linked to the highlight
    page_number INTEGER, -- For ebooks
    cfi_range TEXT, -- EPUB/PDF character range coordinate
    color TEXT DEFAULT 'hsl(45, 100%, 75%)', -- Highlight marker color
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reading Sessions (Active reading duration metrics)
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    library_item_id UUID REFERENCES public.library_items(id) ON DELETE CASCADE,
    duration_seconds INTEGER NOT NULL,
    pages_read INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. User Streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_reading_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Achievements
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL, -- e.g., 'streak_30', 'books_10', 'quran_done'
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);

-- Enable Row Level Security (RLS) on all tables to secure user data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_item_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only access their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can perform all operations on own collections" ON public.collections 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can perform all operations on own library items" ON public.library_items 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can perform all operations on own library item collections" ON public.library_item_collections 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.library_items 
            WHERE id = library_item_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can perform all operations on own highlights" ON public.highlights 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can perform all operations on own reading sessions" ON public.reading_sessions 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can perform all operations on own streaks" ON public.user_streaks 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can perform all operations on own achievements" ON public.achievements 
    FOR ALL USING (auth.uid() = user_id);
