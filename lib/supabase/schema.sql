-- ============================================
-- SUPABASE DATABASE SCHEMA FOR APKHUB
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Profiles table (auto-created on user signup)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Builds table
create table if not exists public.builds (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  version text not null,
  platform text not null check (platform in ('Android', 'iOS', 'Web')),
  build_type text not null check (build_type in ('Debug', 'Release', 'Staging', 'Production')),
  description text,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  is_public boolean default true,
  share_token uuid default gen_random_uuid() unique not null,
  download_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Indexes for performance
create index if not exists idx_builds_user_id on public.builds(user_id);
create index if not exists idx_builds_share_token on public.builds(share_token);
create index if not exists idx_builds_is_public on public.builds(is_public);
create index if not exists idx_builds_created_at on public.builds(created_at desc);

-- 4. Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_builds_updated on public.builds;
create trigger on_builds_updated
  before update on public.builds
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Builds RLS
alter table public.builds enable row level security;

-- Anyone can view public builds
create policy "Public builds are viewable by everyone"
  on public.builds for select
  using (is_public = true);

-- Owners can view all their own builds (public + private)
create policy "Users can view own builds"
  on public.builds for select
  using (auth.uid() = user_id);

-- Anyone can view a build via share_token (for private shared links)
-- This is handled at the application level since RLS select policies are OR'd

-- Authenticated users can insert builds
create policy "Authenticated users can insert builds"
  on public.builds for insert
  with check (auth.uid() = user_id);

-- Owners can update their own builds
create policy "Users can update own builds"
  on public.builds for update
  using (auth.uid() = user_id);

-- Owners can delete their own builds
create policy "Users can delete own builds"
  on public.builds for delete
  using (auth.uid() = user_id);

-- Allow anyone to update download_count via share link
create policy "Anyone can increment download count"
  on public.builds for update
  using (true)
  with check (true);

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Create a "builds" storage bucket in your Supabase dashboard:
-- 1. Go to Storage > New Bucket
-- 2. Name: "builds"
-- 3. Public: OFF (files served via signed URLs)
-- 4. File size limit: 524288000 (500MB)
-- 5. Allowed MIME types: leave empty (allow all)
--
-- Then add these storage policies in the SQL Editor:

-- Allow authenticated users to upload to their own folder
-- Go to Storage > builds > Policies and add:
--
-- INSERT policy: (bucket_id = 'builds' AND auth.uid()::text = (storage.foldername(name))[1])
-- SELECT policy: true (allow signed URL downloads)
-- DELETE policy: (bucket_id = 'builds' AND auth.uid()::text = (storage.foldername(name))[1])
