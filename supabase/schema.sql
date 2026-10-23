-- MELD Supabase schema

create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.patches (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.patches enable row level security;

drop policy if exists "users_read_own_projects" on public.projects;
drop policy if exists "users_insert_own_projects" on public.projects;
drop policy if exists "users_update_own_projects" on public.projects;
drop policy if exists "users_delete_own_projects" on public.projects;

create policy "users_read_own_projects" on public.projects for select to authenticated using ((select auth.uid()) = user_id);
create policy "users_insert_own_projects" on public.projects for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users_update_own_projects" on public.projects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users_delete_own_projects" on public.projects for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "users_read_own_patches" on public.patches;
drop policy if exists "users_insert_own_patches" on public.patches;
drop policy if exists "users_update_own_patches" on public.patches;
drop policy if exists "users_delete_own_patches" on public.patches;

create policy "users_read_own_patches" on public.patches for select to authenticated using ((select auth.uid()) = user_id);
create policy "users_insert_own_patches" on public.patches for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users_update_own_patches" on public.patches for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users_delete_own_patches" on public.patches for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists projects_user_updated_idx on public.projects (user_id, updated_at desc);
create index if not exists patches_user_created_idx on public.patches (user_id, updated_at desc);
