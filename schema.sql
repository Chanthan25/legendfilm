-- ប្រព័ន្ធគ្រប់គ្រងមូលដ្ឋានទិន្នន័យ Video Streaming App 
-- សូម Copy កូដនេះទៅកាន់ផ្ទាំង SQL Editor នៅក្នុងគណនី Supabase របស់អ្នករួចចុច "Run"

-- បើកដំណើរការ Extension សម្រាប់បង្កើត UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ១. បង្កើតតារាង Profiles (សម្រាប់ផ្ទុកព័ត៌មានអ្នកប្រើប្រាស់)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  notification_settings JSONB DEFAULT '{"new_episode": true, "channel_updates": true, "marketing": false}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ២. បង្កើតតារាង Dramas (កុន/វីដេអូ)
CREATE TABLE public.dramas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT[] DEFAULT '{}',
  year INTEGER,
  episodes INTEGER,
  poster TEXT,
  summary TEXT,
  "trailerUrl" TEXT,
  rating NUMERIC(3,1) DEFAULT 0,
  country TEXT,
  channel_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ៣. បង្កើតតារាង Reviews (ការបញ្ចេញមតិយោបល់)
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  drama_id UUID REFERENCES public.dramas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ៤. បង្កើតតារាង Watchlist (វីដេអូរង់ចាំមើល)
CREATE TABLE public.watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  drama_id UUID REFERENCES public.dramas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(user_id, drama_id)
);

-- ៥. បង្កើតតារាង Followers (អ្នកតាមដានថ្នាក់ឆានែល)
CREATE TABLE public.followers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(follower_id, following_id)
);

-- ៦. បង្កើតតារាង Drama Reactions (ប្រតិកម្ម Like/Dislike លើវីដេអូ)
CREATE TABLE public.drama_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  drama_id UUID REFERENCES public.dramas(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(user_id, drama_id)
);

-- ៧. បង្កើត Function និង Trigger សម្រាប់បង្កើត Profile ស្វ័យប្រវត្តិពេល Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', SPLIT_PART(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ៨. បើកប្រព័ន្ធការពារ Row Level Security (RLS) និងកំណត់ Policy (ការអនុញ្ញាត) ទូទៅ
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drama_reactions ENABLE ROW LEVEL SECURITY;

-- គោលការណ៍ Profiles
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- គោលការណ៍ Dramas
CREATE POLICY "Allow public read access" ON public.dramas FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.dramas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow owners update" ON public.dramas FOR UPDATE USING (auth.uid() = channel_id);
CREATE POLICY "Allow owners delete" ON public.dramas FOR DELETE USING (auth.uid() = channel_id);

-- គោលការណ៍ Reviews
CREATE POLICY "Allow public read access" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow owners update" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow owners delete" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- គោលការណ៍ Watchlist
CREATE POLICY "Allow owners read access" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow owners insert" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow owners delete" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

-- គោលការណ៍ Followers
CREATE POLICY "Allow public read access" ON public.followers FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.followers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow owners delete" ON public.followers FOR DELETE USING (auth.uid() = follower_id);

-- គោលការណ៍ Reactions
CREATE POLICY "Allow public read access" ON public.drama_reactions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON public.drama_reactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow owners update" ON public.drama_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow owners delete" ON public.drama_reactions FOR DELETE USING (auth.uid() = user_id);
