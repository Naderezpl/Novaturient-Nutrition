create extension if not exists "pgcrypto";

do $$ begin
  create type auth_source as enum ('web', 'mobile', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.user_credentials (
  user_id uuid primary key references public.users(id) on delete cascade,
  password_text text not null,
  is_admin boolean not null default false,
  can_access_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sign_in_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  attempted_email text not null,
  attempted_role user_role,
  success boolean not null,
  source auth_source not null default 'web',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists user_credentials_admin_idx
  on public.user_credentials (is_admin, can_access_admin);

create index if not exists sign_in_logs_email_idx
  on public.sign_in_logs (attempted_email, created_at desc);

create index if not exists sign_in_logs_user_idx
  on public.sign_in_logs (user_id, created_at desc);

insert into public.users (email, role, full_name)
values ('novaturient.nutritionn@gmail.com', 'dietitian', 'Novaturient Admin')
on conflict (email) do update
set role = excluded.role,
    full_name = excluded.full_name;

insert into public.user_credentials (user_id, password_text, is_admin, can_access_admin)
values (
  (select id from public.users where email = 'novaturient.nutritionn@gmail.com'),
  'admin',
  true,
  true
)
on conflict (user_id) do update
set password_text = excluded.password_text,
    is_admin = excluded.is_admin,
    can_access_admin = excluded.can_access_admin,
    updated_at = now();

create or replace function public.set_updated_at_user_credentials()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists user_credentials_updated_at on public.user_credentials;
create trigger user_credentials_updated_at
before update on public.user_credentials
for each row execute function public.set_updated_at_user_credentials();
