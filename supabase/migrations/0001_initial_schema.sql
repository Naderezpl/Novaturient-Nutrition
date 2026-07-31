-- Neon PostgreSQL Initial Schema
-- Novaturient Nutrition — Premium Exchange-Based Nutrition Platform
-- Compatible with Neon (serverless Postgres)

-- ──────────────────────────────────────────────────────────────────────
-- 1. Extensions
-- ──────────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ──────────────────────────────────────────────────────────────────────
-- 2. Enum Types
-- ──────────────────────────────────────────────────────────────────────
do $$ begin
  create type user_role          as enum ('client', 'dietitian');
  create type client_goal        as enum ('fat_loss', 'maintenance', 'muscle_gain');
  create type activity_level     as enum ('sedentary', 'light', 'moderate', 'active', 'very_active');
  create type exchange_category  as enum ('starch', 'fruit', 'vegetable', 'protein', 'dairy', 'fat');
  create type meal_type          as enum ('breakfast', 'lunch', 'dinner', 'snack');
exception when duplicate_object then null; end $$;

-- ──────────────────────────────────────────────────────────────────────
-- 3. Utility: updated_at trigger
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ──────────────────────────────────────────────────────────────────────
-- 4. Tables
-- ──────────────────────────────────────────────────────────────────────

-- Users — NOTE: when plugging in an auth provider (Neon Auth, Supabase Auth,
-- Clerk, etc.), replace the id / email constraints with provider-managed cols.
create table public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  role        user_role not null,
  full_name   text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create table public.client_profiles (
  user_id               uuid primary key references public.users(id) on delete cascade,
  age                   int not null check (age between 13 and 120),
  sex                   text not null,
  height_cm             numeric(5,2) not null,
  weight_kg             numeric(5,2) not null,
  goal                  client_goal not null,
  activity_level        activity_level not null,
  learning_mode_enabled boolean not null default false,
  water_goal_ml         int not null default 2500,
  updated_at            timestamptz not null default now()
);

create table public.exchange_prescriptions (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.users(id) on delete cascade,
  assigned_by    uuid not null references public.users(id),
  items          jsonb not null,  -- [{category, dailyTarget}]
  effective_date date not null,
  notes          text,
  created_at     timestamptz not null default now()
);

create table public.foods (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  category         exchange_category not null,
  serving_size     text not null,
  exchanges        numeric(5,2) not null,
  image_url        text not null,
  equivalent_foods jsonb not null default '[]'::jsonb,
  learning_tip     text,
  keywords         text[] not null default '{}'::text[],
  created_at       timestamptz not null default now()
);

create table public.meals (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.users(id) on delete cascade,
  meal_type  meal_type not null,
  notes      text,
  logged_at  timestamptz not null default now()
);

create table public.meal_entries (
  id                    uuid primary key default gen_random_uuid(),
  meal_id               uuid not null references public.meals(id) on delete cascade,
  food_id               uuid not null references public.foods(id),
  serving_multiplier    numeric(5,2) not null default 1,
  exchanges_by_category jsonb not null  -- {starch:n, fruit:n, ...}
);

create table public.weight_entries (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.users(id) on delete cascade,
  weight_kg   numeric(5,2) not null,
  recorded_at timestamptz not null default now()
);

create table public.water_entries (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.users(id) on delete cascade,
  amount_ml   int not null check (amount_ml > 0),
  recorded_at timestamptz not null default now()
);

create table public.lessons (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  topic            text not null,
  illustration_url text not null,
  summary          text,
  tips             jsonb not null default '[]'::jsonb,
  takeaways        jsonb not null default '[]'::jsonb,
  content_blocks   jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now()
);

create table public.lesson_progress (
  id                uuid primary key default gen_random_uuid(),
  lesson_id         uuid not null references public.lessons(id) on delete cascade,
  client_id         uuid not null references public.users(id) on delete cascade,
  completion_percent numeric(5,2) not null default 0,
  updated_at        timestamptz not null default now(),
  unique (lesson_id, client_id)
);

create table public.challenge_submissions (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.users(id) on delete cascade,
  challenge_type text not null,
  payload        jsonb not null,
  feedback       text not null,
  created_at     timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────────────
-- 5. updated_at triggers
-- ──────────────────────────────────────────────────────────────────────
create trigger client_profiles_updated_at
before update on public.client_profiles
for each row execute function public.set_updated_at();

create trigger lesson_progress_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────
-- 6. Indexes
-- ──────────────────────────────────────────────────────────────────────

-- users
create index users_role_idx  on public.users (role);
create index users_email_trgm_idx on public.users using gin (email gin_trgm_ops);

-- exchange_prescriptions
create index prescriptions_client_effective_idx
  on public.exchange_prescriptions (client_id, effective_date desc);
create index prescriptions_assigned_by_idx
  on public.exchange_prescriptions (assigned_by);

-- foods — search
create index foods_category_idx     on public.foods (category);
create index foods_name_trgm_idx    on public.foods using gin (name gin_trgm_ops);
create index foods_keywords_idx     on public.foods using gin (keywords);
create index foods_name_fts_idx     on public.foods using gin (to_tsvector('simple', name));

-- meals
create index meals_client_logged_idx on public.meals (client_id, logged_at desc);
create index meals_type_idx          on public.meals (meal_type);

-- meal_entries
create index meal_entries_meal_idx on public.meal_entries (meal_id);
create index meal_entries_food_idx on public.meal_entries (food_id);

-- tracking
create index weight_entries_client_recorded_idx
  on public.weight_entries (client_id, recorded_at desc);
create index water_entries_client_recorded_idx
  on public.water_entries  (client_id, recorded_at desc);

-- lessons
create index lessons_topic_idx     on public.lessons (topic);
create index lessons_slug_trgm_idx on public.lessons using gin (slug gin_trgm_ops);
create index lessons_title_trgm_idx on public.lessons using gin (title gin_trgm_ops);

-- lesson progress
create index lesson_progress_client_idx on public.lesson_progress (client_id);

-- challenges
create index challenges_client_created_idx
  on public.challenge_submissions (client_id, created_at desc);

-- ──────────────────────────────────────────────────────────────────────
-- 7. Row Level Security (RLS)
-- ──────────────────────────────────────────────────────────────────────
alter table public.users                  enable row level security;
alter table public.client_profiles        enable row level security;
alter table public.exchange_prescriptions enable row level security;
alter table public.foods                  enable row level security;
alter table public.meals                  enable row level security;
alter table public.meal_entries           enable row level security;
alter table public.weight_entries         enable row level security;
alter table public.water_entries          enable row level security;
alter table public.lessons                enable row level security;
alter table public.lesson_progress        enable row level security;
alter table public.challenge_submissions  enable row level security;

-- Helper — expose current authenticated user id via app-setting.
-- App must run: set app.current_user_id = '<uuid>'; after authenticating the request.
create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.current_user_id', true), '')::uuid;
$$;

create or replace function public.current_user_role()
returns user_role
language sql
stable
as $$
  select nullif(current_setting('app.current_user_role', true), '')::user_role;
$$;

-- ── users ──────────────────────────────────────────────────────────────
-- Self read/write own row. Dietitians read client rows.
create policy users_select_self_or_dietitian on public.users
  for select
  using (
    id = public.current_user_id()
    or public.current_user_role() = 'dietitian'
  );

create policy users_update_self on public.users
  for update
  using (id = public.current_user_id());

-- ── client_profiles ────────────────────────────────────────────────────
create policy profiles_select_self_or_dietitian on public.client_profiles
  for select
  using (
    user_id = public.current_user_id()
    or public.current_user_role() = 'dietitian'
  );

create policy profiles_upsert_self on public.client_profiles
  for all
  using (user_id = public.current_user_id());

-- ── exchange_prescriptions ─────────────────────────────────────────────
create policy prescriptions_select on public.exchange_prescriptions
  for select
  using (
    client_id   = public.current_user_id()
    or assigned_by = public.current_user_id()
    or public.current_user_role() = 'dietitian'
  );

create policy prescriptions_dietitian_write on public.exchange_prescriptions
  for insert
  with check (
    assigned_by = public.current_user_id()
    and public.current_user_role() = 'dietitian'
  );

create policy prescriptions_dietitian_update on public.exchange_prescriptions
  for update
  using (
    assigned_by = public.current_user_id()
    and public.current_user_role() = 'dietitian'
  );

-- ── foods ──────────────────────────────────────────────────────────────
-- Foods are a read-only reference library for all authenticated users.
create policy foods_all_authenticated_select on public.foods
  for select
  using (public.current_user_id() is not null);

-- ── meals ──────────────────────────────────────────────────────────────
create policy meals_select on public.meals
  for select
  using (
    client_id = public.current_user_id()
    or public.current_user_role() = 'dietitian'
  );

create policy meals_write_self on public.meals
  for insert
  with check (client_id = public.current_user_id());

create policy meals_update_self on public.meals
  for update
  using (client_id = public.current_user_id());

create policy meals_delete_self on public.meals
  for delete
  using (client_id = public.current_user_id());

-- ── meal_entries ───────────────────────────────────────────────────────
create policy meal_entries_select on public.meal_entries
  for select
  using (
    exists (
      select 1 from public.meals m
      where m.id = meal_entries.meal_id
        and (m.client_id = public.current_user_id()
             or public.current_user_role() = 'dietitian')
    )
  );

create policy meal_entries_write on public.meal_entries
  for all
  using (
    exists (
      select 1 from public.meals m
      where m.id = meal_entries.meal_id
        and m.client_id = public.current_user_id()
    )
  );

-- ── weight_entries ─────────────────────────────────────────────────────
create policy weight_entries_select on public.weight_entries
  for select
  using (
    client_id = public.current_user_id()
    or public.current_user_role() = 'dietitian'
  );

create policy weight_entries_write_self on public.weight_entries
  for all
  using (client_id = public.current_user_id());

-- ── water_entries ──────────────────────────────────────────────────────
create policy water_entries_select on public.water_entries
  for select
  using (
    client_id = public.current_user_id()
    or public.current_user_role() = 'dietitian'
  );

create policy water_entries_write_self on public.water_entries
  for all
  using (client_id = public.current_user_id());

-- ── lessons ────────────────────────────────────────────────────────────
create policy lessons_authenticated_select on public.lessons
  for select
  using (public.current_user_id() is not null);

-- ── lesson_progress ────────────────────────────────────────────────────
create policy lesson_progress_select on public.lesson_progress
  for select
  using (
    client_id = public.current_user_id()
    or public.current_user_role() = 'dietitian'
  );

create policy lesson_progress_write_self on public.lesson_progress
  for all
  using (client_id = public.current_user_id());

-- ── challenge_submissions ──────────────────────────────────────────────
create policy challenges_select on public.challenge_submissions
  for select
  using (
    client_id = public.current_user_id()
    or public.current_user_role() = 'dietitian'
  );

create policy challenges_write_self on public.challenge_submissions
  for all
  using (client_id = public.current_user_id());
