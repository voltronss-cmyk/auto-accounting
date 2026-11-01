-- Jalankan di Supabase > SQL Editor
create table if not exists projects(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table projects enable row level security;
create policy "milik sendiri" on projects for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
