-- =============================================
-- 大廈管理委員會系統 - Supabase Schema
-- 在 Supabase Dashboard > SQL Editor 執行此腳本
-- =============================================

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null,
  name text not null,
  unit text not null,
  role text not null default 'resident',
  created_at timestamptz not null default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists issues (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  description text not null,
  category text not null default '其他',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists chairmen (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date timestamptz not null,
  end_date timestamptz not null
);

create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date timestamptz not null,
  agenda text not null default '',
  minutes text not null default '',
  attendees text[] not null default '{}'
);

create table if not exists finance (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  category text not null,
  amount numeric not null,
  description text not null default '',
  receipt text,
  voided boolean not null default false,
  void_reason text,
  voided_at timestamptz
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target_type text not null,
  target_id text not null,
  operator_id text not null,
  reason text,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists reset_tokens (
  token text primary key,
  user_id text not null,
  expires_at timestamptz not null,
  used boolean not null default false
);

-- 關閉 RLS（由後端 service_role key 控制存取）
alter table users disable row level security;
alter table announcements disable row level security;
alter table issues disable row level security;
alter table chairmen disable row level security;
alter table meetings disable row level security;
alter table finance disable row level security;
alter table logs disable row level security;
alter table reset_tokens disable row level security;
