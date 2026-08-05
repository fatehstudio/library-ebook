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

-- Disable Row Level Security (RLS)
ALTER TABLE public.highlights DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements DISABLE ROW LEVEL SECURITY;
