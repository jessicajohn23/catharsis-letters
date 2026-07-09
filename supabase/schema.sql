-- ============================================================
-- CATHARSIS — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_id text,
  created_at timestamptz default now()
);

-- case-insensitive uniqueness on username (nulls allowed pre-onboarding)
create unique index if not exists profiles_username_unique
  on profiles (lower(username))
  where username is not null;

alter table profiles enable row level security;

-- anyone signed in can read basic profile info (needed for "my letters" joins etc.)
-- but note: profiles are NEVER joined into public letter queries, preserving anonymity.
create policy "profiles readable by owner"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles insertable by owner"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles updatable by owner"
  on profiles for update
  using (auth.uid() = id);

-- auto-create a blank profile row right after signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ---------- LETTERS ----------
create table if not exists letters (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  recipient text not null,
  body text not null,
  color_hex text not null default '#FFD6E8',
  stamp text,
  is_future boolean not null default false,
  unlock_at timestamptz,
  future_visibility text check (future_visibility in ('private','public')),
  status text not null default 'posted' check (status in ('posted','locked','unlocked')),
  is_public boolean not null default true,
  posted_at timestamptz,
  created_at timestamptz default now()
);

alter table letters enable row level security;

-- owners can always see + manage their own letters (locked or not)
create policy "letters selectable by owner"
  on letters for select
  using (auth.uid() = author_id);

create policy "letters insertable by owner"
  on letters for insert
  with check (auth.uid() = author_id);

create policy "letters updatable by owner"
  on letters for update
  using (auth.uid() = author_id);

-- Public feed access is intentionally NOT granted via a direct table policy.
-- Instead, all public reads go through get_public_feed() below, which is
-- SECURITY DEFINER and explicitly excludes author_id from its result set.
-- This is what makes anonymity structurally enforced rather than just a
-- convention in the frontend.


-- ---------- HEARTS ----------
create table if not exists hearts (
  letter_id uuid not null references letters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (letter_id, user_id)
);

alter table hearts enable row level security;

create policy "hearts insertable by self"
  on hearts for insert
  with check (auth.uid() = user_id);

create policy "hearts deletable by self"
  on hearts for delete
  using (auth.uid() = user_id);

-- users can see counts via the feed RPC; direct row access limited to their own hearts
create policy "hearts selectable by self"
  on hearts for select
  using (auth.uid() = user_id);


-- ---------- NOTIFICATIONS ----------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  letter_id uuid references letters(id) on delete cascade,
  type text not null default 'letter_unlocked',
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy "notifications selectable by owner"
  on notifications for select
  using (auth.uid() = user_id);

create policy "notifications updatable by owner"
  on notifications for update
  using (auth.uid() = user_id);


-- ---------- PUBLIC FEED RPC ----------
-- Returns only public, posted letters. author_id is deliberately never selected.
create or replace function get_public_feed(sort_by text default 'recent')
returns table (
  id uuid,
  recipient text,
  body text,
  color_hex text,
  stamp text,
  posted_at timestamptz,
  heart_count bigint,
  viewer_has_hearted boolean
) as $$
begin
  return query
  select
    l.id,
    l.recipient,
    l.body,
    l.color_hex,
    l.stamp,
    l.posted_at,
    coalesce(h.count, 0) as heart_count,
    exists(
      select 1 from hearts vh
      where vh.letter_id = l.id and vh.user_id = auth.uid()
    ) as viewer_has_hearted
  from letters l
  left join (
    select letter_id, count(*) as count
    from hearts group by letter_id
  ) h on h.letter_id = l.id
  where l.is_public = true and l.status = 'posted'
  order by
    case when sort_by = 'hearts' then coalesce(h.count, 0) end desc nulls last,
    case when sort_by = 'recent' then l.posted_at end desc nulls last;
end;
$$ language plpgsql security definer;


-- ---------- SCHEDULED UNLOCK ----------
-- Flips locked future-letters to 'unlocked' once unlock_at has passed,
-- makes them public if the author chose 'public', and creates a notification.
create or replace function unlock_due_letters()
returns void as $$
declare
  rec record;
begin
  for rec in
    select * from letters
    where status = 'locked' and unlock_at <= now()
  loop
    update letters
    set status = 'unlocked',
        is_public = (rec.future_visibility = 'public'),
        posted_at = case when rec.future_visibility = 'public' then now() else posted_at end
    where id = rec.id;

    insert into notifications (user_id, letter_id, type)
    values (rec.author_id, rec.id, 'letter_unlocked');
  end loop;
end;
$$ language plpgsql security definer;

-- Run unlock_due_letters() every minute via pg_cron
-- (pg_cron is enabled by default on Supabase — Database → Extensions if not)
select cron.schedule(
  'unlock-due-letters-every-minute',
  '* * * * *',
  $$select unlock_due_letters()$$
);
