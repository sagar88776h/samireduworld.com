-- Samir Edu World: review system
-- Paste this whole file into Supabase → SQL Editor → New query, then click Run.

-- 1. The reviews table
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 2 and 60),
  role        text not null default 'Student'
              check (role in ('Student','Parent','College student','Former student','Teacher or colleague')),
  rating      smallint not null check (rating between 1 and 5),
  message     text not null check (char_length(message) between 10 and 600),
  approved    boolean not null default true
);

-- 2. Security: visitors can read approved reviews and add new ones, nothing else
alter table public.reviews enable row level security;

drop policy if exists "Read approved reviews" on public.reviews;
create policy "Read approved reviews" on public.reviews
  for select to anon, authenticated using (approved = true);

drop policy if exists "Add a review" on public.reviews;
create policy "Add a review" on public.reviews
  for insert to anon, authenticated with check (approved = true);

-- 3. Spam guard: the server sets the time itself and blocks floods
--    (more than 20 reviews in 10 minutes from anyone).
create or replace function public.reviews_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.reviews where created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'Too many reviews right now. Please try again later.';
  end if;
  new.created_at := now();
  return new;
end $$;

drop trigger if exists reviews_guard on public.reviews;
create trigger reviews_guard before insert on public.reviews
  for each row execute function public.reviews_guard();

-- 4. Live updates: new, approved and deleted reviews reach every open page instantly
alter publication supabase_realtime add table public.reviews;


-- ─────────────────────────────────────────────────────────────
-- OPTIONAL: approval mode (reviews wait until you approve them)
-- Run these three lines, then set REVIEWS_NEED_APPROVAL = true in index.html.
-- To approve a review: Table Editor → reviews → tick "approved".
--
-- alter table public.reviews alter column approved set default false;
-- drop policy "Add a review" on public.reviews;
-- create policy "Add a review" on public.reviews for insert to anon, authenticated with check (approved = false);


-- ═════════════════════════════════════════════════════════════
-- ADMIN PANEL (admin.html)
-- Run this part too. Before running, change the email below if needed.
-- ═════════════════════════════════════════════════════════════

-- 5. Who is allowed to edit the website
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;   -- no policies: nobody can read or change it from the website
insert into public.admins (email) values ('sameerdeb91@gmail.com') on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- Lets the login page say "Unauthorized email" before trying to log in or send a reset link.
-- It only answers yes/no for the exact email typed, and lists nothing.
create or replace function public.is_admin_email(check_email text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(trim(check_email)));
$$;
grant execute on function public.is_admin_email(text) to anon, authenticated;

-- 6. Website content (one row, edited from admin.html)
create table if not exists public.site_content (
  id          text primary key default 'main',
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
alter table public.site_content enable row level security;

drop policy if exists "Anyone can read site content" on public.site_content;
create policy "Anyone can read site content" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "Admin can add site content" on public.site_content;
create policy "Admin can add site content" on public.site_content
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admin can edit site content" on public.site_content;
create policy "Admin can edit site content" on public.site_content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 7. Admin can see, hide and delete any review
drop policy if exists "Admin reads all reviews" on public.reviews;
create policy "Admin reads all reviews" on public.reviews
  for select to authenticated using (public.is_admin());

drop policy if exists "Admin updates reviews" on public.reviews;
create policy "Admin updates reviews" on public.reviews
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin deletes reviews" on public.reviews;
create policy "Admin deletes reviews" on public.reviews
  for delete to authenticated using (public.is_admin());

-- 8. Photo storage (public to view, only the admin can upload)
insert into storage.buckets (id, name, public) values ('site-images', 'site-images', true)
  on conflict (id) do nothing;

drop policy if exists "Admin uploads site images" on storage.objects;
create policy "Admin uploads site images" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "Admin changes site images" on storage.objects;
create policy "Admin changes site images" on storage.objects
  for update to authenticated using (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "Admin deletes site images" on storage.objects;
create policy "Admin deletes site images" on storage.objects
  for delete to authenticated using (bucket_id = 'site-images' and public.is_admin());
