-- GetParking – initial schema: profiles, vehicles, sessions, matches, credits.
-- All state transitions go through security-definer RPCs; clients only SELECT their own rows.

create extension if not exists postgis with schema extensions;
create extension if not exists pg_cron;

-- ---------------------------------------------------------------------------
-- Tunables (single source of truth – see docs/PLAN.md)
-- ---------------------------------------------------------------------------
create or replace function public.cfg(key text) returns numeric
language sql immutable as $$
  select case key
    when 'initial_credits'       then 3
    when 'match_radius_m'        then 1500
    when 'search_ttl_s'          then 15 * 60
    when 'leave_ttl_s'           then 20 * 60
    when 'match_ttl_s'           then 10 * 60
    when 'requeue_min_ttl_s'     then 5 * 60   -- time left guaranteed to a party returned to the queue
    when 'confirm_radius_m'      then 30
    when 'location_fresh_s'      then 20
    when 'max_accuracy_m'        then 50
  end
$$;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.session_kind   as enum ('search', 'leave');
create type public.session_status as enum ('active', 'matched', 'completed', 'cancelled', 'expired');
create type public.match_status   as enum ('active', 'completed', 'cancelled', 'expired');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id                uuid primary key references auth.users on delete cascade,
  nickname          text not null default '' check (char_length(nickname) <= 30),
  credits_balance   int  not null default 0 check (credits_balance >= 0),
  active_vehicle_id uuid,
  created_at        timestamptz not null default now()
);

create table public.vehicles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles on delete cascade,
  make_model        text not null check (char_length(make_model) between 1 and 60),
  color             text not null check (char_length(color) between 1 and 30),
  plate_last_digits text not null check (plate_last_digits ~ '^[0-9]{2,3}$'),
  archived_at       timestamptz,
  created_at        timestamptz not null default now()
);
create index on public.vehicles (user_id) where archived_at is null;

alter table public.profiles
  add constraint profiles_active_vehicle_fk
  foreign key (active_vehicle_id) references public.vehicles on delete set null;

create table public.sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles on delete cascade,
  vehicle_id        uuid not null references public.vehicles,
  kind              public.session_kind not null,
  status            public.session_status not null default 'active',
  location          extensions.geography(point, 4326) not null,
  location_accuracy real,
  location_at       timestamptz not null default now(),
  handoff_point     extensions.geography(point, 4326),   -- leave sessions only
  expires_at        timestamptz not null,
  created_at        timestamptz not null default now(),
  ended_at          timestamptz,
  check ((kind = 'leave') = (handoff_point is not null))
);
-- One open session per user.
create unique index sessions_one_open_per_user
  on public.sessions (user_id) where status in ('active', 'matched');
create index sessions_active_search_loc on public.sessions using gist (location)
  where status = 'active' and kind = 'search';
create index sessions_active_leave_handoff on public.sessions using gist (handoff_point)
  where status = 'active' and kind = 'leave';

create table public.matches (
  id                uuid primary key default gen_random_uuid(),
  search_session_id uuid not null references public.sessions,
  leave_session_id  uuid not null references public.sessions,
  searcher_id       uuid not null references public.profiles on delete cascade,
  leaver_id         uuid not null references public.profiles on delete cascade,
  handoff_point     extensions.geography(point, 4326) not null,
  status            public.match_status not null default 'active',
  expires_at        timestamptz not null,
  cancelled_by      uuid references public.profiles,
  created_at        timestamptz not null default now(),
  ended_at          timestamptz
);
create unique index matches_one_active_per_search on public.matches (search_session_id) where status = 'active';
create unique index matches_one_active_per_leave  on public.matches (leave_session_id)  where status = 'active';
create index on public.matches (searcher_id);
create index on public.matches (leaver_id);

create table public.credit_ledger (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles on delete cascade,
  match_id   uuid references public.matches,
  delta      int  not null check (delta <> 0),
  reason     text not null check (reason in ('signup', 'search_fee', 'leave_reward')),
  created_at timestamptz not null default now()
);
create index on public.credit_ledger (user_id);

-- ---------------------------------------------------------------------------
-- RLS: read own rows only. Counterpart details come from get_active_state().
-- ---------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.vehicles      enable row level security;
alter table public.sessions      enable row level security;
alter table public.matches       enable row level security;
alter table public.credit_ledger enable row level security;

create policy "own profile"  on public.profiles      for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "own vehicles" on public.vehicles      for select to authenticated using (user_id = auth.uid());
create policy "add vehicle"  on public.vehicles      for insert to authenticated with check (user_id = auth.uid());
create policy "edit vehicle" on public.vehicles      for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own sessions" on public.sessions      for select to authenticated using (user_id = auth.uid());
create policy "own matches"  on public.matches       for select to authenticated
  using (auth.uid() in (searcher_id, leaver_id));
create policy "own ledger"   on public.credit_ledger for select to authenticated using (user_id = auth.uid());

grant select on public.profiles, public.vehicles, public.sessions, public.matches, public.credit_ledger to authenticated;
grant update (nickname) on public.profiles to authenticated;
grant insert (user_id, make_model, color, plate_last_digits) on public.vehicles to authenticated;
grant update (make_model, color, plate_last_digits, archived_at) on public.vehicles to authenticated;

-- ---------------------------------------------------------------------------
-- Signup: profile + initial credits
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  initial int := public.cfg('initial_credits');
begin
  insert into public.profiles (id, credits_balance) values (new.id, initial);
  insert into public.credit_ledger (user_id, delta, reason) values (new.id, initial, 'signup');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.make_point(lat double precision, lng double precision)
returns extensions.geography language sql immutable set search_path = public, extensions as $$
  select st_setsrid(st_makepoint(lng, lat), 4326)::geography
$$;

-- Try to pair an active session with the nearest active counterpart.
-- Internal only (not granted). Returns the new match id or null.
create or replace function public.try_match(p_session_id uuid) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  me     public.sessions;
  other  public.sessions;
  srch   public.sessions;
  lv     public.sessions;
  m_id   uuid;
begin
  select * into me from public.sessions
   where id = p_session_id and status = 'active' and expires_at > now()
   for update skip locked;
  if not found then return null; end if;

  -- Ordered by st_distance, not the <-> KNN operator: KNN on geography combined with
  -- FOR UPDATE fails with "attempted to lock invisible tuple". st_dwithin still uses the index.
  if me.kind = 'search' then
    select * into other from public.sessions s
     where s.kind = 'leave' and s.status = 'active' and s.expires_at > now()
       and s.user_id <> me.user_id
       and st_dwithin(s.handoff_point, me.location, cfg('match_radius_m'))
     order by st_distance(s.handoff_point, me.location)
     limit 1
     for update skip locked;
  else
    select * into other from public.sessions s
     where s.kind = 'search' and s.status = 'active' and s.expires_at > now()
       and s.user_id <> me.user_id
       and st_dwithin(s.location, me.handoff_point, cfg('match_radius_m'))
     order by st_distance(s.location, me.handoff_point)
     limit 1
     for update skip locked;
  end if;
  if not found then return null; end if;

  if me.kind = 'search' then srch := me; lv := other; else srch := other; lv := me; end if;

  insert into public.matches (search_session_id, leave_session_id, searcher_id, leaver_id, handoff_point, expires_at)
  values (srch.id, lv.id, srch.user_id, lv.user_id, lv.handoff_point,
          now() + make_interval(secs => cfg('match_ttl_s')))
  returning id into m_id;

  update public.sessions set status = 'matched' where id in (me.id, other.id);
  return m_id;
end $$;

create or replace function public.open_session(p_user uuid) returns public.sessions
language sql stable security definer set search_path = public as $$
  select * from public.sessions where user_id = p_user and status in ('active', 'matched')
$$;

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------
create or replace function public.set_active_vehicle(p_vehicle_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.vehicles
                  where id = p_vehicle_id and user_id = auth.uid() and archived_at is null) then
    raise exception 'vehicle_not_found';
  end if;
  update public.profiles set active_vehicle_id = p_vehicle_id where id = auth.uid();
end $$;

create or replace function public.start_session(
  p_kind public.session_kind, lat double precision, lng double precision, accuracy real
) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare
  uid  uuid := auth.uid();
  prof public.profiles;
  pt   geography := make_point(lat, lng);
  sid  uuid;
begin
  select * into prof from public.profiles where id = uid;
  if prof.active_vehicle_id is null then raise exception 'no_active_vehicle'; end if;
  if p_kind = 'search' and prof.credits_balance < 1 then raise exception 'insufficient_credits'; end if;
  if (public.open_session(uid)).id is not null then raise exception 'session_already_open'; end if;

  insert into public.sessions (user_id, vehicle_id, kind, location, location_accuracy, handoff_point, expires_at)
  values (uid, prof.active_vehicle_id, p_kind, pt, accuracy,
          case when p_kind = 'leave' then pt end,
          now() + make_interval(secs => cfg(case when p_kind = 'search' then 'search_ttl_s' else 'leave_ttl_s' end)))
  returning id into sid;

  perform public.try_match(sid);
  return sid;
end $$;

create or replace function public.start_search(lat double precision, lng double precision, accuracy real default null)
returns uuid language sql security definer set search_path = public as $$
  select public.start_session('search', lat, lng, accuracy)
$$;

create or replace function public.start_leave(lat double precision, lng double precision, accuracy real default null)
returns uuid language sql security definer set search_path = public as $$
  select public.start_session('leave', lat, lng, accuracy)
$$;

create or replace function public.update_location(lat double precision, lng double precision, accuracy real default null)
returns void
language plpgsql security definer set search_path = public, extensions as $$
declare
  s public.sessions;
begin
  update public.sessions
     set location = make_point(lat, lng), location_accuracy = accuracy, location_at = now()
   where user_id = auth.uid() and status in ('active', 'matched')
  returning * into s;

  if s.id is not null and s.status = 'active' and s.kind = 'search' then
    perform public.try_match(s.id);
  end if;
end $$;

create or replace function public.cancel_active() returns void
language plpgsql security definer set search_path = public as $$
declare
  uid   uuid := auth.uid();
  s     public.sessions;
  m     public.matches;
  other uuid;
begin
  select * into s from public.sessions
   where user_id = uid and status in ('active', 'matched') for update;
  if not found then return; end if;

  if s.status = 'matched' then
    update public.matches set status = 'cancelled', cancelled_by = uid, ended_at = now()
     where status = 'active' and (search_session_id = s.id or leave_session_id = s.id)
    returning * into m;

    other := case when m.search_session_id = s.id then m.leave_session_id else m.search_session_id end;
    -- The other party goes back to the queue.
    update public.sessions
       set status = 'active',
           expires_at = greatest(expires_at, now() + make_interval(secs => cfg('requeue_min_ttl_s')))
     where id = other and status = 'matched';
  end if;

  update public.sessions set status = 'cancelled', ended_at = now() where id = s.id;

  if other is not null then perform public.try_match(other); end if;
end $$;

create or replace function public.confirm_parked(p_match_id uuid) returns int
language plpgsql security definer set search_path = public, extensions as $$
declare
  uid  uuid := auth.uid();
  m    public.matches;
  srch public.sessions;
  lv   public.sessions;
  bal  int;
begin
  select * into m from public.matches where id = p_match_id for update;
  if not found or m.searcher_id <> uid then raise exception 'match_not_found'; end if;
  if m.status <> 'active' or m.expires_at <= now() then raise exception 'match_not_active'; end if;

  select * into srch from public.sessions where id = m.search_session_id;
  select * into lv   from public.sessions where id = m.leave_session_id;

  if srch.location_at < now() - make_interval(secs => cfg('location_fresh_s'))
     or lv.location_at < now() - make_interval(secs => cfg('location_fresh_s')) then
    raise exception 'location_stale';
  end if;
  if coalesce(srch.location_accuracy, 0) > cfg('max_accuracy_m')
     or coalesce(lv.location_accuracy, 0) > cfg('max_accuracy_m') then
    raise exception 'location_inaccurate';
  end if;
  if not st_dwithin(srch.location, lv.location, cfg('confirm_radius_m')) then
    raise exception 'too_far';
  end if;

  update public.matches  set status = 'completed', ended_at = now() where id = m.id;
  update public.sessions set status = 'completed', ended_at = now() where id in (srch.id, lv.id);

  update public.profiles set credits_balance = credits_balance - 1 where id = m.searcher_id returning credits_balance into bal;
  update public.profiles set credits_balance = credits_balance + 1 where id = m.leaver_id;
  insert into public.credit_ledger (user_id, match_id, delta, reason) values
    (m.searcher_id, m.id, -1, 'search_fee'),
    (m.leaver_id,   m.id,  1, 'leave_reward');

  return bal;
end $$;

-- Everything a screen needs, including the counterpart's minimal identity.
create or replace function public.get_active_state() returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  uid  uuid := auth.uid();
  s    public.sessions;
  m    public.matches;
  cp   uuid;
  res  jsonb;
begin
  select * into s from public.sessions
   where user_id = uid order by created_at desc limit 1;

  res := jsonb_build_object(
    'credits', (select credits_balance from public.profiles where id = uid),
    'session', case when s.id is null then null else jsonb_build_object(
      'id', s.id, 'kind', s.kind, 'status', s.status, 'expires_at', s.expires_at,
      'handoff', case when s.handoff_point is null then null else
        jsonb_build_object('lat', st_y(s.handoff_point::geometry), 'lng', st_x(s.handoff_point::geometry)) end
    ) end
  );

  if s.id is not null then
    select * into m from public.matches
     where search_session_id = s.id or leave_session_id = s.id
     order by created_at desc limit 1;
  end if;

  if m.id is not null then
    cp := case when m.searcher_id = uid then m.leaver_id else m.searcher_id end;
    res := res || jsonb_build_object('match', jsonb_build_object(
      'id', m.id, 'status', m.status, 'expires_at', m.expires_at,
      'role', case when m.searcher_id = uid then 'searcher' else 'leaver' end,
      'handoff', jsonb_build_object('lat', st_y(m.handoff_point::geometry), 'lng', st_x(m.handoff_point::geometry)),
      'counterpart', (
        select jsonb_build_object(
          'nickname', p.nickname, 'make_model', v.make_model, 'color', v.color,
          'plate_last_digits', v.plate_last_digits)
          || case when m.status = 'active'   -- location only while the match is live
               then jsonb_build_object('lat', st_y(cs.location::geometry), 'lng', st_x(cs.location::geometry))
               else '{}'::jsonb end
          from public.sessions cs
          join public.profiles p on p.id = cs.user_id
          join public.vehicles v on v.id = cs.vehicle_id
         where cs.id = case when m.searcher_id = uid then m.leave_session_id else m.search_session_id end)
    ));
  end if;

  return res;
end $$;

-- Cron: expire stale sessions/matches, retry matching for waiting sessions.
create or replace function public.expire_and_sweep() returns void
language plpgsql security definer set search_path = public as $$
declare
  r record;
begin
  with expired as (
    update public.matches set status = 'expired', ended_at = now()
     where status = 'active' and expires_at <= now()
    returning search_session_id, leave_session_id
  )
  update public.sessions set status = 'expired', ended_at = now()
   where id in (select search_session_id from expired union all select leave_session_id from expired);

  update public.sessions set status = 'expired', ended_at = now()
   where status = 'active' and expires_at <= now();

  for r in select id from public.sessions where status = 'active' and kind = 'search' order by created_at loop
    perform public.try_match(r.id);
  end loop;
end $$;

select cron.schedule('parking-expire-and-sweep', '15 seconds', 'select public.expire_and_sweep()');

-- ---------------------------------------------------------------------------
-- Function grants: only the public RPCs are callable by clients.
-- ---------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function
  public.set_active_vehicle(uuid),
  public.start_search(double precision, double precision, real),
  public.start_leave(double precision, double precision, real),
  public.update_location(double precision, double precision, real),
  public.cancel_active(),
  public.confirm_parked(uuid),
  public.get_active_state()
to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: status via postgres_changes, live location via private broadcast
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.sessions, public.matches;

create policy "match participants broadcast" on realtime.messages
  for all to authenticated
  using (
    realtime.topic() like 'match:%'
    and exists (select 1 from public.matches m
                 where m.id::text = substring(realtime.topic() from 7)
                   and m.status = 'active'
                   and auth.uid() in (m.searcher_id, m.leaver_id))
  )
  with check (
    realtime.topic() like 'match:%'
    and exists (select 1 from public.matches m
                 where m.id::text = substring(realtime.topic() from 7)
                   and m.status = 'active'
                   and auth.uid() in (m.searcher_id, m.leaver_id))
  );
