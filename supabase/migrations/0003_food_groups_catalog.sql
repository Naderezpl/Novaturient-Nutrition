create extension if not exists "pgcrypto";

create table if not exists public.food_group_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.food_group_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.food_group_categories(id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);

create table if not exists public.food_group_items (
  id uuid primary key default gen_random_uuid(),
  subcategory_id uuid not null references public.food_group_subcategories(id) on delete cascade,
  name text not null,
  exchange_category text not null,
  serving_size text not null,
  exchanges numeric(5,2) not null default 1,
  image_url text,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists food_group_subcategories_category_idx
  on public.food_group_subcategories (category_id, sort_order);

create index if not exists food_group_items_subcategory_idx
  on public.food_group_items (subcategory_id, sort_order);

create index if not exists food_group_items_name_idx
  on public.food_group_items (name);

insert into public.food_group_categories (slug, name, sort_order)
values
  ('starches', 'Starches', 1),
  ('fruits', 'Fruits', 2),
  ('vegetables', 'Vegetables', 3),
  ('protein', 'Protein', 4),
  ('dairy', 'Dairy', 5),
  ('fats', 'Fats', 6)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order;

with categories as (
  select id, slug from public.food_group_categories
)
insert into public.food_group_subcategories (category_id, slug, name, sort_order)
values
  ((select id from categories where slug = 'starches'), 'grains-cereals', 'Grains & cereals', 1),
  ((select id from categories where slug = 'starches'), 'breads-wraps', 'Breads & wraps', 2),
  ((select id from categories where slug = 'starches'), 'starchy-vegetables-snacks', 'Starchy vegetables & snacks', 3),
  ((select id from categories where slug = 'starches'), 'beans-mixed-starches', 'Beans & mixed starches', 4),

  ((select id from categories where slug = 'fruits'), 'whole-fruits', 'Whole fruits', 1),
  ((select id from categories where slug = 'fruits'), 'fresh-fruit-bowls', 'Fresh fruit bowls', 2),
  ((select id from categories where slug = 'fruits'), 'dried-fruit-juices', 'Dried fruit & juices', 3),

  ((select id from categories where slug = 'vegetables'), 'leafy-greens', 'Leafy greens', 1),
  ((select id from categories where slug = 'vegetables'), 'green-vegetables', 'Green vegetables', 2),
  ((select id from categories where slug = 'vegetables'), 'salad-vegetables', 'Salad vegetables', 3),
  ((select id from categories where slug = 'vegetables'), 'cooked-vegetables', 'Cooked vegetables', 4),

  ((select id from categories where slug = 'protein'), 'meats-poultry', 'Meats & poultry', 1),
  ((select id from categories where slug = 'protein'), 'fish-seafood', 'Fish & seafood', 2),
  ((select id from categories where slug = 'protein'), 'eggs', 'Eggs', 3),
  ((select id from categories where slug = 'protein'), 'dairy-proteins', 'Dairy proteins', 4),
  ((select id from categories where slug = 'protein'), 'plant-proteins', 'Plant proteins', 5),

  ((select id from categories where slug = 'dairy'), 'milks-drinks', 'Milks & drinks', 1),
  ((select id from categories where slug = 'dairy'), 'yogurts', 'Yogurts', 2),
  ((select id from categories where slug = 'dairy'), 'cheeses', 'Cheeses', 3),
  ((select id from categories where slug = 'dairy'), 'dessert-dairy', 'Dessert dairy', 4),

  ((select id from categories where slug = 'fats'), 'oils-spreads', 'Oils & spreads', 1),
  ((select id from categories where slug = 'fats'), 'avocado-olives', 'Avocado & olives', 2),
  ((select id from categories where slug = 'fats'), 'nuts', 'Nuts', 3),
  ((select id from categories where slug = 'fats'), 'seeds-creamy-extras', 'Seeds & creamy extras', 4)
on conflict (category_id, slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order;

insert into public.users (email, role, full_name)
values ('novaturient.nutritionn@gmail.com', 'dietitian', 'Novaturient Admin')
on conflict (email) do update
set role = excluded.role,
    full_name = excluded.full_name;
