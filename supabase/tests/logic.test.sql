-- Business logic of the RPCs. Each block starts from test.reset() and fails
-- the run on the first broken expectation. Distances: 0.0045° of latitude is
-- about 500 m; the match radius is 1,500 m and the confirm radius 30 m.
\set ON_ERROR_STOP 1
set search_path = public, extensions;
set client_min_messages = notice;

-- ─── Signup ──────────────────────────────────────────────────────────────

do $$ begin
  perform test.reset();
  insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000ee');
  perform test.assert_eq(
    (select credits_balance from profiles where id = '00000000-0000-0000-0000-0000000000ee'), 3,
    'signup: a new user gets a profile with 3 credits');
  perform test.assert_eq(
    (select sum(delta)::int from credit_ledger where user_id = '00000000-0000-0000-0000-0000000000ee' and reason = 'signup'), 3,
    'signup: the starting credits are in the ledger');
end $$;

-- ─── Active vehicle ──────────────────────────────────────────────────────

do $$ begin
  perform test.reset();
  perform test.login('a');
  perform test.assert_raises(
    format('select set_active_vehicle(%L)', (select id from vehicles where user_id = test.user_id('b'))),
    'vehicle_not_found', 'active vehicle: cannot pick another driver''s car');
  update vehicles set archived_at = now() where user_id = test.user_id('a');
  perform test.assert_raises(
    format('select set_active_vehicle(%L)', (select id from vehicles where user_id = test.user_id('a'))),
    'vehicle_not_found', 'active vehicle: cannot pick an archived car');
end $$;

-- ─── Starting a session ──────────────────────────────────────────────────

do $$ begin
  perform test.reset();
  perform test.login('a');
  perform start_search(32.08, 34.78, 10);
  perform test.assert_raises('select start_search(32.08, 34.78, 10)', 'session_already_open',
    'start: a second open session is refused');
  perform test.assert_raises('select start_leave(32.08, 34.78, 10)', 'session_already_open',
    'start: cannot leave while searching');
end $$;

do $$ begin
  perform test.reset();
  update profiles set active_vehicle_id = null where id = test.user_id('a');
  perform test.login('a');
  perform test.assert_raises('select start_search(32.08, 34.78, 10)', 'no_active_vehicle',
    'start: searching needs an active car');
  perform test.assert_raises('select start_leave(32.08, 34.78, 10)', 'no_active_vehicle',
    'start: leaving needs an active car');
end $$;

do $$ begin
  perform test.reset();
  update profiles set credits_balance = 0 where id = test.user_id('a');
  perform test.login('a');
  perform test.assert_raises('select start_search(32.08, 34.78, 10)', 'insufficient_credits',
    'start: searching with no credits is refused');
  perform start_leave(32.08, 34.78, 10);
  perform test.assert_eq(test.session_status('a'), 'active', 'start: leaving needs no credits');
end $$;

-- ─── Matching ────────────────────────────────────────────────────────────

do $$ begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0800, 34.78, 10);
  perform test.login('b'); perform start_search(32.0845, 34.78, 10);   -- ~500 m
  perform test.assert_eq(test.active_matches(), 1::bigint, 'match: searcher within radius is matched');
  perform test.assert_eq(test.session_status('a'), 'matched', 'match: leaver session is matched');
  perform test.assert_eq(test.session_status('b'), 'matched', 'match: searcher session is matched');
  perform test.assert_eq(
    (select (searcher_id, leaver_id) = (test.user_id('b'), test.user_id('a')) from matches), true,
    'match: roles are searcher B, leaver A');
end $$;

do $$ begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0800, 34.78, 10);
  perform test.login('b'); perform start_search(32.1000, 34.78, 10);   -- ~2.2 km
  perform test.assert_eq(test.active_matches(), 0::bigint, 'match: searcher outside radius is not matched');
  perform test.assert_eq(test.session_status('b'), 'active', 'match: unmatched searcher keeps waiting');
end $$;

do $$ begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0900, 34.78, 10);    -- ~1.1 km from B
  perform test.login('c'); perform start_leave(32.0805, 34.78, 10);    -- ~55 m from B
  perform test.login('b'); perform start_search(32.0800, 34.78, 10);
  perform test.assert_eq((select leaver_id from matches), test.user_id('c'),
    'match: the nearest leaver is chosen');
  perform test.assert_eq(test.session_status('a'), 'active', 'match: the farther leaver keeps waiting');
end $$;

do $$ begin
  perform test.reset();
  perform test.login('b'); perform start_search(32.0800, 34.78, 10);
  perform test.login('a'); perform start_leave(32.0810, 34.78, 10);
  perform test.assert_eq(test.active_matches(), 1::bigint, 'match: a new leaver finds a waiting searcher');
end $$;

do $$ begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0800, 34.78, 10);
  perform test.login('b'); perform start_search(32.1000, 34.78, 10);
  perform update_location(32.0810, 34.78, 10);
  perform test.assert_eq(test.active_matches(), 1::bigint, 'match: a searcher who drives into range is matched');
end $$;

-- ─── Cancelling ──────────────────────────────────────────────────────────

do $$ begin
  perform test.reset();
  perform test.login('b'); perform start_search(32.08, 34.78, 10);
  perform cancel_active();
  perform test.assert_eq(test.session_status('b'), 'cancelled', 'cancel: before a match closes the session');
  perform cancel_active();   -- nothing open: a no-op, not an error
  perform test.assert_eq(test.session_status('b'), 'cancelled', 'cancel: with nothing open is a no-op');
end $$;

do $$ begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0800, 34.78, 10);
  perform test.login('b'); perform start_search(32.0810, 34.78, 10);
  update sessions set expires_at = now() + interval '1 minute' where user_id = test.user_id('a');
  perform cancel_active();   -- B, the searcher, cancels
  perform test.assert_eq(test.session_status('b'), 'cancelled', 'cancel after match: the canceller is closed');
  perform test.assert_eq(
    (select (status, cancelled_by) = ('cancelled'::match_status, test.user_id('b')) from matches), true,
    'cancel after match: the match is cancelled by B');
  perform test.assert_eq(test.session_status('a'), 'active', 'cancel after match: the other side is back in the queue');
  perform test.assert_eq(
    (select expires_at >= now() + interval '5 minutes' from sessions where user_id = test.user_id('a') and status = 'active'), true,
    'cancel after match: the requeued side gets at least 5 more minutes');
end $$;

do $$ begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0800, 34.78, 10);
  perform test.login('b'); perform start_search(32.0810, 34.78, 10);   -- matched with A
  perform test.login('c'); perform start_search(32.0820, 34.78, 10);   -- waits: A is taken
  perform test.assert_eq(test.session_status('c'), 'active', 'requeue: a second searcher waits while the leaver is taken');
  perform test.login('b'); perform cancel_active();
  perform test.assert_eq(
    (select searcher_id from matches where status = 'active'), test.user_id('c'),
    'requeue: the freed leaver is matched with the waiting searcher');
end $$;

do $$ begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0800, 34.78, 10);
  perform test.login('b'); perform start_search(32.0810, 34.78, 10);
  perform test.login('a'); perform cancel_active();   -- the leaver cancels
  perform test.assert_eq(test.session_status('b'), 'active', 'cancel by leaver: the searcher is back in the queue');
  perform test.assert_eq(test.credits('b'), 3, 'cancel by leaver: the searcher is not charged');
end $$;

-- ─── Expiry ──────────────────────────────────────────────────────────────

do $$ begin
  perform test.reset();
  perform test.login('b'); perform start_search(32.0800, 34.78, 10);
  update sessions set expires_at = now() - interval '1 second';
  perform expire_and_sweep();
  perform test.assert_eq(test.session_status('b'), 'expired', 'expiry: a waiting search expires');
end $$;

do $$ begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0800, 34.78, 10);
  perform test.login('b'); perform start_search(32.0810, 34.78, 10);
  update matches set expires_at = now() - interval '1 second';
  perform expire_and_sweep();
  perform test.assert_eq((select status::text from matches), 'expired', 'expiry: a stale match expires');
  perform test.assert_eq(test.session_status('a'), 'expired', 'expiry: the leaver session expires with it');
  perform test.assert_eq(test.session_status('b'), 'expired', 'expiry: the searcher session expires with it');
  perform test.assert_eq(test.credits('b'), 3, 'expiry: nobody is charged');
end $$;

-- ─── Confirming "parked" ─────────────────────────────────────────────────

do $$
declare
  match_id uuid;
begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0800, 34.78, 10);
  perform test.login('b'); perform start_search(32.0845, 34.78, 10);   -- ~500 m away
  select id into match_id from matches;

  perform test.login('a');
  perform test.assert_raises(format('select confirm_parked(%L)', match_id), 'match_not_found',
    'confirm: only the searcher can confirm');

  perform test.login('b');
  perform test.assert_raises(format('select confirm_parked(%L)', match_id), 'too_far',
    'confirm: refused while the two are far apart');

  perform update_location(32.0801, 34.78, 8);                         -- ~11 m from A
  perform test.login('a'); perform update_location(32.0800, 34.78, 8);
  update sessions set location_at = now() - interval '30 seconds' where user_id = test.user_id('a');
  perform test.login('b');
  perform test.assert_raises(format('select confirm_parked(%L)', match_id), 'location_stale',
    'confirm: refused when a location is older than 20 s');

  perform test.login('a'); perform update_location(32.0800, 34.78, 80);
  perform test.login('b');
  perform test.assert_raises(format('select confirm_parked(%L)', match_id), 'location_inaccurate',
    'confirm: refused when a location is less accurate than 50 m');

  perform test.login('a'); perform update_location(32.0800, 34.78, 8);
  perform test.login('b');
  perform test.assert_eq(confirm_parked(match_id), 2, 'confirm: returns the searcher''s new balance');
  perform test.assert_eq(test.credits('b'), 2, 'credits: the searcher pays 1');
  perform test.assert_eq(test.credits('a'), 4, 'credits: the leaver earns 1');
  perform test.assert_eq((select status::text from matches), 'completed', 'confirm: the match is completed');
  perform test.assert_eq(test.session_status('a'), 'completed', 'confirm: the leaver session is completed');
  perform test.assert_eq(test.session_status('b'), 'completed', 'confirm: the searcher session is completed');
  perform test.assert_eq(
    (select bool_and(p.credits_balance = (select sum(delta) from credit_ledger l where l.user_id = p.id)) from profiles p),
    true, 'credits: every balance equals the sum of its ledger');

  perform test.assert_raises(format('select confirm_parked(%L)', match_id), 'match_not_active',
    'confirm: a completed match cannot be confirmed again');
end $$;

do $$
declare
  match_id uuid;
begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0800, 34.78, 8);
  perform test.login('b'); perform start_search(32.0801, 34.78, 8);
  select id into match_id from matches;
  update matches set expires_at = now() - interval '1 second';
  perform test.assert_raises(format('select confirm_parked(%L)', match_id), 'match_not_active',
    'confirm: an expired match cannot be confirmed');
end $$;

-- ─── What each side sees ─────────────────────────────────────────────────

do $$
declare
  state jsonb;
begin
  perform test.reset();
  perform test.login('a'); perform start_leave(32.0800, 34.78, 10);
  perform test.login('b'); perform start_search(32.0810, 34.78, 10);
  state := get_active_state();
  perform test.assert_eq(state -> 'match' ->> 'role', 'searcher', 'state: B sees itself as the searcher');
  perform test.assert_eq(state -> 'match' -> 'counterpart' ->> 'nickname', 'Driver a', 'state: B sees A''s nickname');
  perform test.assert_eq(state -> 'match' -> 'counterpart' ->> 'make_model', 'Car a', 'state: B sees A''s car');
  perform test.assert_eq(state -> 'match' -> 'counterpart' ? 'lat', true, 'state: live location while the match is active');

  perform cancel_active();
  perform test.login('a');
  state := get_active_state();
  perform test.assert_eq(state -> 'match' ->> 'status', 'cancelled', 'state: A sees the match was cancelled');
  perform test.assert_eq(state -> 'match' -> 'counterpart' ? 'lat', false, 'state: no location once the match ended');
end $$;

-- ─── Permissions (as a signed-in client) ─────────────────────────────────

do $$ begin perform test.reset(); perform test.login('a'); end $$;
set role authenticated;

do $$ begin
  perform test.assert_eq((select count(*) from profiles), 1::bigint, 'rls: a driver sees only their own profile');
  perform test.assert_eq((select count(*) from vehicles), 1::bigint, 'rls: a driver sees only their own cars');
  perform test.assert_raises('select try_match(gen_random_uuid())', 'permission denied',
    'grants: internal matching cannot be called by clients');
  perform test.assert_raises('select expire_and_sweep()', 'permission denied',
    'grants: the sweep cannot be called by clients');
  perform test.assert_raises(
    format('update profiles set credits_balance = 100 where id = %L', test.user_id('a')), 'permission denied',
    'grants: a driver cannot set their own credits');
  perform test.assert_raises(
    format('insert into vehicles (user_id, make_model, color, plate_last_digits) values (%L, %L, %L, %L)',
           test.user_id('b'), 'Fake', 'red', '99'),
    'row-level security', 'rls: a driver cannot add a car for someone else');
  perform test.assert_raises(
    format('update profiles set nickname = %L where id = %L', repeat('x', 31), test.user_id('a')), 'nickname',
    'constraint: a nickname over 30 characters is refused');
end $$;

reset role;
