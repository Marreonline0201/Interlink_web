-- Enable pgcrypto for gen_random_uuid if not already present
create extension if not exists "pgcrypto";

create table if not exists public.match_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  major text,
  graduation_year integer,
  interests text[] default '{}',
  hobbies text[] default '{}',
  classes text[] default '{}',
  bio text,
  fun_fact text,
  favorite_spot text,
  vibe_check text,
  is_opted_in boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.match_profiles(id) on delete cascade,
  title text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists availability_slots_user_time_idx
  on public.availability_slots (user_id, start_time);

comment on table public.match_profiles is 'Profiles participating in the matchmaking feature.';
comment on table public.availability_slots is 'Canonical availability blocks associated with match_profiles.';

