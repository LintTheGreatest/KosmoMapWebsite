-- Run this in the Supabase SQL Editor to create a public, shared POI table.
create table if not exists public.pois (
  id uuid primary key default gen_random_uuid(),
  x double precision not null check (x >= 0 and x <= 100000),
  y double precision not null check (y >= 0 and y <= 100000),
  created_at timestamptz not null default now()
);

alter table public.pois enable row level security;
revoke all on table public.pois from anon, authenticated;
grant select, insert on table public.pois to anon;

drop policy if exists "Anyone can view POIs" on public.pois;
create policy "Anyone can view POIs"
  on public.pois for select to anon
  using (true);

drop policy if exists "Anyone can add POIs" on public.pois;
create policy "Anyone can add POIs"
  on public.pois for insert to anon
  with check (true);
