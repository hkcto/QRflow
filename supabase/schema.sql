-- QRflow — dynamic QR code MVP schema
-- Run this once in Supabase → SQL Editor → New query → Run.
-- Safe to re-run: every statement is idempotent.

create table if not exists public.qrcodes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),
  code        text not null unique check (code ~ '^[a-z0-9]{7}$'),
  target_url  text not null,
  scan_count  integer not null default 0 check (scan_count >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Styled appearance (dot shape, colours, background). Validated by the app
-- against a strict allow-list before it is written. Existing rows get `{}`,
-- which the app normalizes to the classic style.
alter table public.qrcodes
  add column if not exists style jsonb not null default '{}'::jsonb;

-- Content type. URL codes use `target_url` + `/r/<code>` (editable, tracked).
-- Text/Wi-Fi/vCard codes store their content in `payload` and encode it
-- directly, so `target_url` is an empty string and `/r/<code>` is unused.
alter table public.qrcodes
  add column if not exists kind text not null default 'url';
alter table public.qrcodes
  add column if not exists payload jsonb not null default '{}'::jsonb;

do $$
begin
  alter table public.qrcodes
    add constraint qrcodes_kind_check
    check (kind in ('url', 'text', 'wifi', 'vcard'));
exception
  when duplicate_object then null;
end
$$;

create index if not exists qrcodes_user_created_idx
  on public.qrcodes (user_id, created_at desc);

alter table public.qrcodes enable row level security;

-- Users only ever see and mutate their own rows.
drop policy if exists "Users can view own qrcodes" on public.qrcodes;
create policy "Users can view own qrcodes"
  on public.qrcodes for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own qrcodes" on public.qrcodes;
create policy "Users can insert own qrcodes"
  on public.qrcodes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own qrcodes" on public.qrcodes;
create policy "Users can update own qrcodes"
  on public.qrcodes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own qrcodes" on public.qrcodes;
create policy "Users can delete own qrcodes"
  on public.qrcodes for delete
  using (auth.uid() = user_id);

-- Anonymous scans: atomically increment the counter and return the destination.
-- The redirect route calls this RPC. There is deliberately NO anon SELECT policy
-- on the table, so nobody can dump every destination through PostgREST.
create or replace function public.increment_scan(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target text;
begin
  update public.qrcodes
     set scan_count = scan_count + 1
   where code = p_code
     and is_active
  returning target_url into v_target;

  return v_target;
end;
$$;

-- Public lookup kept for backwards compatibility. The client-side renderer no
-- longer needs it, but it is harmless and non-destructive to keep.
create or replace function public.get_qr_public(p_code text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select q.name
  from public.qrcodes q
  where q.code = p_code
    and q.is_active;
$$;

revoke all on function public.increment_scan(text) from public;
revoke all on function public.get_qr_public(text) from public;

grant execute on function public.increment_scan(text) to anon, authenticated;
grant execute on function public.get_qr_public(text) to anon, authenticated;
