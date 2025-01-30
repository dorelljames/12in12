create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a secure RLS policy
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Create an index for faster username lookups
create index if not exists profiles_username_idx on public.profiles (username); 