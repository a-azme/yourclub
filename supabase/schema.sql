-- =====================================================================
-- YourClub: database schema
-- Run order in the Supabase SQL Editor:
--   1) schema.sql   (this file: tables, functions, triggers, views)
--   2) policies.sql (Row Level Security)
--   3) seed.sql     (demo organizations, fests and events)
-- Safe to run more than once.
-- =====================================================================

-- ============================ TABLES ================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  student_id text,
  phone text,
  department text,
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.fests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  tagline text,
  description text,
  venue text,
  start_date date not null,
  end_date date not null,
  image_url text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  fest_id uuid not null references public.fests(id) on delete cascade,
  title text not null,
  description text,
  category text not null
    check (category in ('Programming', 'AI & ML', 'Robotics', 'Gaming', 'Workshop', 'Quiz')),
  venue text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  registration_deadline timestamptz not null,
  capacity integer not null check (capacity > 0),
  fee numeric not null default 0 check (fee >= 0),
  icon text,
  image_url text,
  created_at timestamptz not null default now(),
  check (end_time >= start_time)
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  student_id text,
  department text,
  extra jsonb not null default '{}'::jsonb,
  status text not null default 'confirmed'
    check (status in ('pending', 'confirmed', 'cancelled', 'waitlisted')),
  checked_in boolean not null default false,
  cancel_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete cascade,
  type text not null check (type in ('cancelled', 'confirmed', 'waitlisted')),
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Cancel reason column for databases created before it existed
alter table public.registrations add column if not exists cancel_reason text;

-- ============================ INDEXES ===============================

create index if not exists fests_organization_idx on public.fests (organization_id);
create index if not exists fests_start_idx on public.fests (start_date);
create index if not exists events_fest_idx on public.events (fest_id);
create index if not exists events_start_idx on public.events (start_time);
create index if not exists registrations_event_idx on public.registrations (event_id, status, created_at);
create index if not exists registrations_user_idx on public.registrations (user_id);
create index if not exists notifications_user_idx on public.notifications (user_id, read, created_at desc);

-- A student can hold only one active registration per event (cancelled ones do not count)
create unique index if not exists registrations_one_active_per_user
  on public.registrations (event_id, user_id)
  where status <> 'cancelled';

-- ====================== HELPER FUNCTIONS ============================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ================== PROFILE CREATED AT SIGN UP ======================
-- Works for email/password sign up (metadata from the form) and for Google.
-- New accounts are always students; admins are set manually in the database.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, student_id, phone, department)
  values (
    NEW.id,
    coalesce(
      nullif(NEW.raw_user_meta_data ->> 'full_name', ''),
      nullif(NEW.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(NEW.email, ''), '@', 1),
      ''
    ),
    coalesce(NEW.email, ''),
    'user',
    nullif(NEW.raw_user_meta_data ->> 'student_id', ''),
    nullif(NEW.raw_user_meta_data ->> 'phone', ''),
    nullif(NEW.raw_user_meta_data ->> 'department', '')
  )
  on conflict (id) do nothing;
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Only an admin may change a role
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.role is distinct from OLD.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an admin can change a role.';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
before update on public.profiles
for each row execute function public.protect_profile_role();

-- ============== REGISTRATION: SEATS AND WAITLIST ====================
-- Only confirmed registrations hold a seat.

-- New registration: confirmed if a seat is free, otherwise waitlisted
create or replace function public.registration_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap integer;
  taken integer;
begin
  -- Lock the event row so two people cannot take the last seat together
  select capacity into cap from public.events where id = NEW.event_id for update;
  if cap is null then
    raise exception 'Event not found.';
  end if;

  if NEW.status = 'cancelled' then
    return NEW;
  end if;

  select count(*) into taken
  from public.registrations
  where event_id = NEW.event_id and status = 'confirmed';

  NEW.status := case when taken < cap then 'confirmed' else 'waitlisted' end;
  return NEW;
end;
$$;

drop trigger if exists trg_registration_before_insert on public.registrations;
create trigger trg_registration_before_insert
before insert on public.registrations
for each row execute function public.registration_before_insert();

-- Changing a status to confirmed needs a free seat
create or replace function public.registration_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cap integer;
  taken integer;
begin
  if NEW.status = 'confirmed'
     and (OLD.status is distinct from 'confirmed' or OLD.event_id <> NEW.event_id) then
    select capacity into cap from public.events where id = NEW.event_id for update;

    select count(*) into taken
    from public.registrations
    where event_id = NEW.event_id and status = 'confirmed' and id <> NEW.id;

    if taken >= cap then
      raise exception
        'This event is full (% / % seats). Cancel a confirmed registration or increase the capacity first.',
        taken, cap
        using errcode = 'P0001';
    end if;
  end if;

  if NEW.status <> 'cancelled' then
    NEW.cancel_reason := null;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_registration_before_update on public.registrations;
create trigger trg_registration_before_update
before update of status, event_id on public.registrations
for each row execute function public.registration_before_update();

-- Waitlist auto-promotion (first come, first served)
create or replace function public.promote_waitlist(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cap integer;
  taken integer;
  free integer;
begin
  select capacity into cap from public.events where id = p_event_id for update;
  if cap is null then
    return;
  end if;

  select count(*) into taken
  from public.registrations
  where event_id = p_event_id and status = 'confirmed';

  free := cap - taken;
  if free <= 0 then
    return;
  end if;

  update public.registrations
  set status = 'confirmed'
  where id in (
    select id from public.registrations
    where event_id = p_event_id and status = 'waitlisted'
    order by created_at asc
    limit free
  );
end;
$$;

revoke all on function public.promote_waitlist(uuid) from public, anon, authenticated;

-- Notifications and promotion after a status change
create or replace function public.registration_after_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ev_title text;
begin
  select title into ev_title from public.events where id = NEW.event_id;

  if NEW.status = 'cancelled'
     and OLD.status <> 'cancelled'
     and auth.uid() is distinct from NEW.user_id then
    insert into public.notifications (user_id, event_id, registration_id, type, title, body)
    values (
      NEW.user_id, NEW.event_id, NEW.id, 'cancelled',
      'Registration cancelled',
      format('The organizer cancelled your registration for "%s".', ev_title)
        || coalesce(' Reason: ' || NEW.cancel_reason, '')
    );

  elsif NEW.status = 'confirmed' and OLD.status = 'waitlisted' then
    insert into public.notifications (user_id, event_id, registration_id, type, title, body)
    values (
      NEW.user_id, NEW.event_id, NEW.id, 'confirmed',
      'You got a seat!',
      format('A seat opened up and your registration for "%s" is now confirmed.', ev_title)
    );

  elsif NEW.status = 'waitlisted'
        and OLD.status = 'confirmed'
        and auth.uid() is distinct from NEW.user_id then
    insert into public.notifications (user_id, event_id, registration_id, type, title, body)
    values (
      NEW.user_id, NEW.event_id, NEW.id, 'waitlisted',
      'Moved to the waitlist',
      format('The organizer moved your registration for "%s" to the waitlist.', ev_title)
    );
  end if;

  -- A confirmed seat was released: give it to the next person on the waitlist
  if OLD.status = 'confirmed' and NEW.status <> 'confirmed' then
    perform public.promote_waitlist(NEW.event_id);
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_registration_after_update on public.registrations;
create trigger trg_registration_after_update
after update of status on public.registrations
for each row execute function public.registration_after_update();

-- Deleting a confirmed registration also frees a seat
create or replace function public.registration_after_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.status = 'confirmed' then
    perform public.promote_waitlist(OLD.event_id);
  end if;
  return OLD;
end;
$$;

drop trigger if exists trg_registration_after_delete on public.registrations;
create trigger trg_registration_after_delete
after delete on public.registrations
for each row execute function public.registration_after_delete();

-- Raising an event's capacity promotes the waitlist
create or replace function public.event_after_capacity_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.promote_waitlist(NEW.id);
  return NEW;
end;
$$;

drop trigger if exists trg_event_after_capacity_change on public.events;
create trigger trg_event_after_capacity_change
after update of capacity on public.events
for each row
when (NEW.capacity > OLD.capacity)
execute function public.event_after_capacity_change();

-- ============================== VIEWS ===============================
-- Counts only (no personal data), readable by everyone.

create or replace view public.event_stats as
select
  e.id as event_id,
  e.capacity,
  count(r.id) filter (where r.status = 'confirmed') as registered_count,
  count(r.id) filter (where r.status = 'waitlisted') as waitlist_count
from public.events e
left join public.registrations r on r.event_id = e.id
group by e.id, e.capacity;

create or replace view public.event_counts as
select
  e.id as event_id,
  e.capacity,
  (count(r.id) filter (where r.status = 'confirmed'))::int as registered_count,
  (count(r.id) filter (where r.status = 'waitlisted'))::int as waitlist_count
from public.events e
left join public.registrations r on r.event_id = e.id
group by e.id, e.capacity;

create or replace view public.site_stats as
select
  (select count(*) from public.fests
     where end_date >= (now() at time zone 'Asia/Dhaka')::date) as upcoming_fests,
  (select count(*) from public.events) as total_events,
  (select count(*) from public.registrations where status = 'confirmed') as registered_participants,
  (select count(distinct organization_id) from public.fests) as active_organizations;

grant select on public.event_stats, public.event_counts, public.site_stats
  to anon, authenticated;