-- NEON POSTGRES — NOVATURIENT NUTRITION
-- Combined script: Schema + Seed (single run)
-- Files referenced:
--   migrations/0001_initial_schema.sql
--   migrations/0002_seed_demo_data.sql

-- 1. Extensions ------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- 2. Enum Types ------------------------------------------------------
do $$ begin
  create type user_role          as enum ('client', 'dietitian');
  create type client_goal        as enum ('fat_loss', 'maintenance', 'muscle_gain');
  create type activity_level     as enum ('sedentary', 'light', 'moderate', 'active', 'very_active');
  create type exchange_category  as enum ('starch', 'fruit', 'vegetable', 'protein', 'dairy', 'fat');
  create type meal_type          as enum ('breakfast', 'lunch', 'dinner', 'snack');
exception when duplicate_object then null; end $$;

-- 3. Utility functions ----------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.current_user_id()
returns uuid language sql stable as $$
  select nullif(current_setting('app.current_user_id', true), '')::uuid;
$$;

create or replace function public.current_user_role()
returns user_role language sql stable as $$
  select nullif(current_setting('app.current_user_role', true), '')::user_role;
$$;

create or replace function public.urlencode(value text) returns text language sql immutable as $$
  select regexp_replace(
           replace(replace(value, ' ', '%20'), '/', '%2F'),
           '([^a-zA-Z0-9%._~-])',
           '%' || upper(lpad(to_hex(ascii('\1')),2,'0')),
           'g'
         );
$$;

-- 4. Tables ----------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  role        user_role not null,
  full_name   text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create table if not exists public.client_profiles (
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

create table if not exists public.exchange_prescriptions (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.users(id) on delete cascade,
  assigned_by    uuid not null references public.users(id),
  items          jsonb not null,
  effective_date date not null,
  notes          text,
  created_at     timestamptz not null default now()
);

create table if not exists public.foods (
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

create table if not exists public.meals (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.users(id) on delete cascade,
  meal_type  meal_type not null,
  notes      text,
  logged_at  timestamptz not null default now()
);

create table if not exists public.meal_entries (
  id                    uuid primary key default gen_random_uuid(),
  meal_id               uuid not null references public.meals(id) on delete cascade,
  food_id               uuid not null references public.foods(id),
  serving_multiplier    numeric(5,2) not null default 1,
  exchanges_by_category jsonb not null
);

create table if not exists public.weight_entries (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.users(id) on delete cascade,
  weight_kg   numeric(5,2) not null,
  recorded_at timestamptz not null default now()
);

create table if not exists public.water_entries (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.users(id) on delete cascade,
  amount_ml   int not null check (amount_ml > 0),
  recorded_at timestamptz not null default now()
);

create table if not exists public.lessons (
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

create table if not exists public.lesson_progress (
  id                uuid primary key default gen_random_uuid(),
  lesson_id         uuid not null references public.lessons(id) on delete cascade,
  client_id         uuid not null references public.users(id) on delete cascade,
  completion_percent numeric(5,2) not null default 0,
  updated_at        timestamptz not null default now(),
  unique (lesson_id, client_id)
);

create table if not exists public.challenge_submissions (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.users(id) on delete cascade,
  challenge_type text not null,
  payload        jsonb not null,
  feedback       text not null,
  created_at     timestamptz not null default now()
);

-- 5. updated_at triggers --------------------------------------------
drop trigger if exists client_profiles_updated_at on public.client_profiles;
create trigger client_profiles_updated_at before update on public.client_profiles
for each row execute function public.set_updated_at();

drop trigger if exists lesson_progress_updated_at on public.lesson_progress;
create trigger lesson_progress_updated_at before update on public.lesson_progress
for each row execute function public.set_updated_at();

-- 6. Indexes ---------------------------------------------------------
create index if not exists users_role_idx            on public.users (role);
create index if not exists users_email_trgm_idx      on public.users using gin (email gin_trgm_ops);
create index if not exists prescriptions_client_effective_idx on public.exchange_prescriptions (client_id, effective_date desc);
create index if not exists prescriptions_assigned_by_idx       on public.exchange_prescriptions (assigned_by);
create index if not exists foods_category_idx        on public.foods (category);
create index if not exists foods_name_trgm_idx       on public.foods using gin (name gin_trgm_ops);
create index if not exists foods_keywords_idx        on public.foods using gin (keywords);
create index if not exists foods_name_fts_idx        on public.foods using gin (to_tsvector('simple', name));
create index if not exists meals_client_logged_idx   on public.meals (client_id, logged_at desc);
create index if not exists meals_type_idx            on public.meals (meal_type);
create index if not exists meal_entries_meal_idx     on public.meal_entries (meal_id);
create index if not exists meal_entries_food_idx     on public.meal_entries (food_id);
create index if not exists weight_entries_client_recorded_idx on public.weight_entries (client_id, recorded_at desc);
create index if not exists water_entries_client_recorded_idx  on public.water_entries  (client_id, recorded_at desc);
create index if not exists lessons_topic_idx         on public.lessons (topic);
create index if not exists lessons_slug_trgm_idx     on public.lessons using gin (slug gin_trgm_ops);
create index if not exists lessons_title_trgm_idx    on public.lessons using gin (title gin_trgm_ops);
create index if not exists lesson_progress_client_idx on public.lesson_progress (client_id);
create index if not exists challenges_client_created_idx on public.challenge_submissions (client_id, created_at desc);

-- 7. RLS -------------------------------------------------------------
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

-- users
drop policy if exists users_select_self_or_dietitian on public.users;
create policy users_select_self_or_dietitian on public.users for select
using (id = public.current_user_id() or public.current_user_role() = 'dietitian');

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users for update
using (id = public.current_user_id());

-- client_profiles
drop policy if exists profiles_select_self_or_dietitian on public.client_profiles;
create policy profiles_select_self_or_dietitian on public.client_profiles for select
using (user_id = public.current_user_id() or public.current_user_role() = 'dietitian');

drop policy if exists profiles_upsert_self on public.client_profiles;
create policy profiles_upsert_self on public.client_profiles for all
using (user_id = public.current_user_id());

-- exchange_prescriptions
drop policy if exists prescriptions_select on public.exchange_prescriptions;
create policy prescriptions_select on public.exchange_prescriptions for select
using (client_id = public.current_user_id() or assigned_by = public.current_user_id() or public.current_user_role() = 'dietitian');

drop policy if exists prescriptions_dietitian_write on public.exchange_prescriptions;
create policy prescriptions_dietitian_write on public.exchange_prescriptions for insert
with check (assigned_by = public.current_user_id() and public.current_user_role() = 'dietitian');

drop policy if exists prescriptions_dietitian_update on public.exchange_prescriptions;
create policy prescriptions_dietitian_update on public.exchange_prescriptions for update
using (assigned_by = public.current_user_id() and public.current_user_role() = 'dietitian');

-- foods
drop policy if exists foods_all_authenticated_select on public.foods;
create policy foods_all_authenticated_select on public.foods for select
using (public.current_user_id() is not null);

-- meals
drop policy if exists meals_select on public.meals;
create policy meals_select on public.meals for select
using (client_id = public.current_user_id() or public.current_user_role() = 'dietitian');

drop policy if exists meals_write_self on public.meals;
create policy meals_write_self on public.meals for insert with check (client_id = public.current_user_id());

drop policy if exists meals_update_self on public.meals;
create policy meals_update_self on public.meals for update using (client_id = public.current_user_id());

drop policy if exists meals_delete_self on public.meals;
create policy meals_delete_self on public.meals for delete using (client_id = public.current_user_id());

-- meal_entries
drop policy if exists meal_entries_select on public.meal_entries;
create policy meal_entries_select on public.meal_entries for select using (
  exists (select 1 from public.meals m where m.id = meal_entries.meal_id
          and (m.client_id = public.current_user_id() or public.current_user_role() = 'dietitian'))
);

drop policy if exists meal_entries_write on public.meal_entries;
create policy meal_entries_write on public.meal_entries for all using (
  exists (select 1 from public.meals m where m.id = meal_entries.meal_id
          and m.client_id = public.current_user_id())
);

-- weight_entries
drop policy if exists weight_entries_select on public.weight_entries;
create policy weight_entries_select on public.weight_entries for select
using (client_id = public.current_user_id() or public.current_user_role() = 'dietitian');

drop policy if exists weight_entries_write_self on public.weight_entries;
create policy weight_entries_write_self on public.weight_entries for all
using (client_id = public.current_user_id());

-- water_entries
drop policy if exists water_entries_select on public.water_entries;
create policy water_entries_select on public.water_entries for select
using (client_id = public.current_user_id() or public.current_user_role() = 'dietitian');

drop policy if exists water_entries_write_self on public.water_entries;
create policy water_entries_write_self on public.water_entries for all
using (client_id = public.current_user_id());

-- lessons
drop policy if exists lessons_authenticated_select on public.lessons;
create policy lessons_authenticated_select on public.lessons for select
using (public.current_user_id() is not null);

-- lesson_progress
drop policy if exists lesson_progress_select on public.lesson_progress;
create policy lesson_progress_select on public.lesson_progress for select
using (client_id = public.current_user_id() or public.current_user_role() = 'dietitian');

drop policy if exists lesson_progress_write_self on public.lesson_progress;
create policy lesson_progress_write_self on public.lesson_progress for all
using (client_id = public.current_user_id());

-- challenge_submissions
drop policy if exists challenges_select on public.challenge_submissions;
create policy challenges_select on public.challenge_submissions for select
using (client_id = public.current_user_id() or public.current_user_role() = 'dietitian');

drop policy if exists challenges_write_self on public.challenge_submissions;
create policy challenges_write_self on public.challenge_submissions for all
using (client_id = public.current_user_id());

-- ═══════════════════════════════════════════════════════════════════
--  SEED DATA
-- ═══════════════════════════════════════════════════════════════════

insert into public.users (id, email, role, full_name) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'leena@novaturient.app',       'dietitian', 'Dr. Leena Rahal'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'mila.nasser@novaturient.app', 'client',    'Mila Nasser')
on conflict (email) do nothing;

insert into public.client_profiles
  (user_id, age, sex, height_cm, weight_kg, goal, activity_level, learning_mode_enabled, water_goal_ml)
values
  ('aaaaaaaa-0000-4000-8000-000000000002',
   27, 'female', 162.00, 62.00, 'fat_loss', 'light', false, 2500)
on conflict (user_id) do nothing;

insert into public.exchange_prescriptions
  (client_id, assigned_by, items, effective_date, notes)
values
  ('aaaaaaaa-0000-4000-8000-000000000002',
   'aaaaaaaa-0000-4000-8000-000000000001',
   '[{"category":"starch","dailyTarget":10},{"category":"fruit","dailyTarget":4},{"category":"vegetable","dailyTarget":4},{"category":"protein","dailyTarget":8},{"category":"dairy","dailyTarget":3},{"category":"fat","dailyTarget":5}]'::jsonb,
   current_date,
   'Balanced starting plan with focus on protein and vegetables. Adjust after two weeks.')
on conflict do nothing;

do $$
declare
  first_names text[] := array[
    'Ava','Layla','Nora','Mira','Zayn','Omar','Mason','Lina','Sara','Noah',
    'Mila','Adam','Talia','Yara','Leo','Ivy','Dina','Elias','Rami','Jana',
    'Luca','Maya','Hana','Amir','Sami','Ella','Reem','Nadine','Rayan','Celine'
  ];
  last_names text[] := array['Haddad','Salem','Khan','Ibrahim','Murphy','Yousef','Parker','Mansour','Aziz','Nasser'];
  goals      text[] := array['fat_loss','maintenance','muscle_gain'];
  levels     text[] := array['sedentary','light','moderate','active','very_active'];
  i int; uid uuid; fn text; ln text; g text; l text;
begin
  for i in 0..29 loop
    fn  := first_names[i+1];
    ln  := last_names[(i % 10)+1];
    uid := ('bbbbbbbb-0000-4000-8000-' || lpad((i+1)::text, 12, '0'))::uuid;
    g   := goals[(i % 3)+1];
    l   := levels[(i % 5)+1];
    insert into public.users (id, email, role, full_name)
    values (uid, lower(fn || '.' || ln || '@novaturient.app'), 'client', initcap(fn) || ' ' || initcap(ln))
    on conflict (email) do nothing;
    insert into public.client_profiles
      (user_id, age, sex, height_cm, weight_kg, goal, activity_level, learning_mode_enabled, water_goal_ml)
    values (uid, 23 + (i % 19),
            case when i % 2 = 0 then 'female' else 'male' end,
            158.00 + (i % 18), 58.00 + i,
            g::client_goal, l::activity_level, false, 2200 + ((i % 4) * 300))
    on conflict (user_id) do nothing;
  end loop;
end $$;

do $$
declare i int; uid uuid; s int; f int; v int; p int; d int; fa int;
begin
  for i in 0..29 loop
    uid := ('bbbbbbbb-0000-4000-8000-' || lpad((i+1)::text, 12, '0'))::uuid;
    s  := 8 + (i % 4); f  := 3 + (i % 2); v  := 4 + (i % 2);
    p  := 7 + (i % 3); d  := 2 + (i % 2); fa := 4 + (i % 3);
    insert into public.exchange_prescriptions
      (client_id, assigned_by, items, effective_date, notes)
    values
      (uid, 'aaaaaaaa-0000-4000-8000-000000000001',
       format('[{"category":"starch","dailyTarget":%s},{"category":"fruit","dailyTarget":%s},{"category":"vegetable","dailyTarget":%s},{"category":"protein","dailyTarget":%s},{"category":"dairy","dailyTarget":%s},{"category":"fat","dailyTarget":%s}]', s,f,v,p,d,fa)::jsonb,
       current_date - (i % 30),
       'Initial prescription based on onboarding goals.')
    on conflict do nothing;
  end loop;
end $$;

do $$
declare
  cats exchange_category[] := array['starch','fruit','vegetable','protein','dairy','fat'];
  bases jsonb := '{
    "starch":    ["Brown Rice","Oatmeal","Pita Bread","Sweet Potato","Quinoa","Popcorn","Pasta","Tortilla"],
    "fruit":     ["Apple","Banana","Berries","Orange","Pear","Mango","Kiwi","Peaches"],
    "vegetable": ["Cucumber","Spinach","Carrots","Tomato","Broccoli","Peppers","Zucchini","Salad Greens"],
    "protein":   ["Chicken Breast","Salmon","Eggs","Turkey","Greek Yogurt","Lentils","Tofu","Tuna"],
    "dairy":     ["Milk","Labneh","Yogurt","Kefir","Cottage Cheese","Cheese Cubes","Ricotta","Laban"],
    "fat":       ["Olive Oil","Avocado","Tahini","Nuts","Seeds","Peanut Butter","Walnuts","Hummus"]
  }';
  portions jsonb := '{
    "starch":    ["1/3 cup cooked","1 slice","1 small","1/2 cup cooked","3 cups popped"],
    "fruit":     ["1 small","1 medium","3/4 cup","1 cup sliced","1/2 large"],
    "vegetable": ["1 cup raw","1/2 cup cooked","1 bowl","3/4 cup"],
    "protein":   ["1 oz","2 oz","1/2 cup","3/4 cup","1 piece"],
    "dairy":     ["1 cup","3/4 cup","1/3 cup","2 slices"],
    "fat":       ["1 tsp","1 tbsp","1/8 avocado","6 pieces","2 tbsp"]
  }';
  cat text; arr text[]; parr text[]; n text; p text; ex numeric; eq jsonb; kw text[]; tip text; i int; idx int;
begin
  foreach cat in array cats loop
    arr  := array(select jsonb_array_elements_text(bases->cat));
    parr := array(select jsonb_array_elements_text(portions->cat));
    for i in 1..56 loop
      idx := i - 1;
      n   := arr[(idx % array_length(arr,1))+1] || ' ' || i;
      p   := parr[(idx % array_length(parr,1))+1];
      ex  := case when cat = 'vegetable' then 0.5 else 1 end;
      eq  := jsonb_build_array(
               arr[((idx+1) % array_length(arr,1))+1] || ' '  || parr[((idx+1) % array_length(parr,1))+1],
               arr[((idx+2) % array_length(arr,1))+1] || ' '  || parr[((idx+2) % array_length(parr,1))+1],
               arr[((idx+3) % array_length(arr,1))+1] || ' '  || parr[((idx+3) % array_length(parr,1))+1]
             );
      kw  := array[lower(arr[(idx % array_length(arr,1))+1]), cat, 'exchange', 'meal', 'portion'];
      tip := arr[(idx % array_length(arr,1))+1] || ' can fit well in a balanced meal when you pair it with protein or fiber for staying power.';
      insert into public.foods (name, category, serving_size, exchanges, image_url, equivalent_foods, learning_tip, keywords)
      values (n, cat::exchange_category, p, ex,
              'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=' ||
                public.urlencode('luxury food photography, ' || n || ', premium nutrition app, pastel soft light, clean plate, professional healthcare aesthetic') ||
                '&image_size=portrait_4_3',
              eq, tip, kw)
      on conflict do nothing;
    end loop;
  end loop;
end $$;

do $$
declare
  specs jsonb := '[
    ["what-are-food-exchanges",  "What are food exchanges?",   "Foundations"],
    ["building-balanced-meals",  "Building balanced meals",    "Meals"],
    ["portion-sizes",            "Portion sizes",              "Practical skills"],
    ["reading-nutrition-labels", "Reading nutrition labels",   "Practical skills"],
    ["meal-prep",                "Meal prep",                  "Lifestyle"],
    ["grocery-shopping",         "Grocery shopping",           "Lifestyle"],
    ["eating-out",               "Eating out",                 "Lifestyle"],
    ["protein",                  "Protein essentials",         "Nutrition"],
    ["healthy-fats",             "Healthy fats",               "Nutrition"],
    ["water-and-hydration",      "Water and hydration",        "Nutrition"],
    ["vegetables",               "Why vegetables matter",      "Nutrition"]
  ]';
  rec jsonb; i int; slug text; title text; topic text;
begin
  for i in 0..jsonb_array_length(specs)-1 loop
    rec   := specs->i;
    slug  := rec->>0; title := rec->>1; topic := rec->>2;
    insert into public.lessons (slug, title, topic, illustration_url, summary, tips, takeaways, content_blocks)
    values (slug, title, topic,
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=' ||
        public.urlencode('premium editorial healthcare illustration, soft pastel nutrition education, ' || title || ', glassmorphism card art, elegant minimal website visual') ||
        '&image_size=landscape_16_9',
      'A calm, practical lesson with quick wins, food examples, and simple decisions you can use today.',
      '["Pair one anchor food with one support food to make meals easier to repeat.","Use the exchange system to flex portions instead of labeling foods as good or bad.","Keep your meals familiar. Better structure is often more useful than full reinvention."]'::jsonb,
      jsonb_build_array(
        'Build confidence through repetition.',
        'Keep meals satisfying before you make them stricter.',
        'Lesson ' || (i+1) || ' supports flexible consistency.'
      ),
      '[]'::jsonb
    ) on conflict (slug) do nothing;
  end loop;
end $$;

do $$
declare cid uuid := 'aaaaaaaa-0000-4000-8000-000000000002'; mid uuid;
begin
  insert into public.meals (client_id, meal_type, notes, logged_at)
  values (cid, 'breakfast', 'Nice balance. Consider one vegetable exchange later.', '2026-07-31T08:30:00Z')
  returning id into mid;
  insert into public.meal_entries (meal_id, food_id, serving_multiplier, exchanges_by_category)
  select mid, id, 1, '{"starch":0.5}'::jsonb from public.foods where name like 'Brown Rice%' limit 1;

  insert into public.meals (client_id, meal_type, logged_at)
  values (cid, 'lunch', '2026-07-31T13:00:00Z') returning id into mid;
  insert into public.meal_entries (meal_id, food_id, serving_multiplier, exchanges_by_category)
  select mid, id, 1, '{"protein":1}'::jsonb from public.foods where name like 'Chicken Breast%' limit 1;

  insert into public.meals (client_id, meal_type, logged_at)
  values (cid, 'snack', '2026-07-31T16:00:00Z') returning id into mid;
  insert into public.meal_entries (meal_id, food_id, serving_multiplier, exchanges_by_category)
  select mid, id, 1, '{"dairy":1}'::jsonb from public.foods where name like 'Greek Yogurt%' limit 1;
end $$;

do $$
declare cid uuid := 'aaaaaaaa-0000-4000-8000-000000000002'; d int; w numeric;
begin
  for d in 0..6 loop
    w := 74.0 - (d * 0.08);
    insert into public.weight_entries (client_id, weight_kg, recorded_at)
    values (cid, round(w,1)::numeric(5,2), now() - (d || ' days')::interval);
    insert into public.water_entries  (client_id, amount_ml,   recorded_at)
    values (cid, 1600 + (d*150),       now() - (d || ' days')::interval);
  end loop;
end $$;
