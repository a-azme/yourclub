-- =====================================================================
-- YourClub: Row Level Security policies
-- Run AFTER schema.sql. Safe to run more than once.
-- Admin check: public.is_admin() (defined in schema.sql)
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.fests enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.notifications enable row level security;

-- ============================ PROFILES ==============================
-- Profiles are created by the sign-up trigger, so there is no insert policy.
-- Accounts are deleted on the server with the service role key.

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ====================== ORGANIZATIONS / FESTS / EVENTS ==============
-- Everyone can read; only admins can write.

drop policy if exists "organizations_select_all" on public.organizations;
create policy "organizations_select_all" on public.organizations
  for select to anon, authenticated using (true);

drop policy if exists "organizations_admin_write" on public.organizations;
create policy "organizations_admin_write" on public.organizations
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "fests_select_all" on public.fests;
create policy "fests_select_all" on public.fests
  for select to anon, authenticated using (true);

drop policy if exists "fests_admin_write" on public.fests;
create policy "fests_admin_write" on public.fests
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "events_select_all" on public.events;
create policy "events_select_all" on public.events
  for select to anon, authenticated using (true);

drop policy if exists "events_admin_write" on public.events;
create policy "events_admin_write" on public.events
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =========================== REGISTRATIONS ==========================

drop policy if exists "registrations_select_own_or_admin" on public.registrations;
create policy "registrations_select_own_or_admin" on public.registrations
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- A student can register only as themselves.
-- The real status (confirmed / waitlisted) is decided by a trigger.
drop policy if exists "registrations_insert_own" on public.registrations;
create policy "registrations_insert_own" on public.registrations
  for insert to authenticated
  with check (user_id = auth.uid());

-- A student can only cancel their own registration
drop policy if exists "registrations_cancel_own" on public.registrations;
create policy "registrations_cancel_own" on public.registrations
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and status = 'cancelled');

drop policy if exists "registrations_admin_update" on public.registrations;
create policy "registrations_admin_update" on public.registrations
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "registrations_admin_delete" on public.registrations;
create policy "registrations_admin_delete" on public.registrations
  for delete to authenticated
  using (public.is_admin());

-- =========================== NOTIFICATIONS ==========================
-- Rows are created by triggers. A user can read their own and mark them as read.

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke insert, update, delete on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;