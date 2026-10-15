-- Test helpers: fixed users, acting as one of them, and assertions that fail
-- the run (ON_ERROR_STOP) instead of printing something to eyeball.
create schema test;

-- Users are named by a letter: test.user_id('a') .. test.user_id('d').
create function test.user_id(letter text) returns uuid language sql immutable as $$
  select ('00000000-0000-0000-0000-00000000000' || letter)::uuid
$$;

-- Everything the RPCs see as auth.uid() — see auth.uid() in local_stubs.sql.
create function test.login(letter text) returns void language sql as $$
  select set_config('test.uid', test.user_id(letter)::text, false)
$$;

-- Empty database with four signed-up drivers, each with a nickname, one car
-- (active) and the starting credits from the signup trigger.
create function test.reset() returns void language plpgsql as $$
begin
  -- delete, not truncate: same result for a few rows, without a notice per table.
  delete from public.credit_ledger;
  delete from public.matches;
  delete from public.sessions;
  update public.profiles set active_vehicle_id = null;
  delete from public.vehicles;
  delete from public.profiles;
  delete from auth.users;
  insert into auth.users (id) select test.user_id(letter) from unnest(array['a', 'b', 'c', 'd']) letter;
  insert into public.vehicles (user_id, make_model, color, plate_last_digits)
    select id, 'Car ' || right(id::text, 1), 'white', '12' from public.profiles;
  update public.profiles p
     set active_vehicle_id = v.id, nickname = 'Driver ' || right(p.id::text, 1)
    from public.vehicles v where v.user_id = p.id;
  perform set_config('test.uid', '', false);
end $$;

create function test.assert_eq(actual anyelement, expected anyelement, label text) returns void
language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL %: expected %, got %', label, expected, actual;
  end if;
  raise notice 'ok   %', label;
end $$;

-- Runs `statement` and requires it to fail with an error containing `expected`.
-- The failure check sits outside the block that catches the statement's
-- error, so a statement that succeeds really does fail the test.
create function test.assert_raises(statement text, expected text, label text) returns void
language plpgsql as $$
declare
  error_message text;
begin
  begin
    execute statement;
  exception when others then
    error_message := sqlerrm;
  end;
  if error_message is null then
    raise exception 'FAIL %: expected error "%", but it succeeded', label, expected;
  end if;
  if position(expected in error_message) = 0 then
    raise exception 'FAIL %: expected error "%", got "%"', label, expected, error_message;
  end if;
  raise notice 'ok   %', label;
end $$;

-- Shorthands for reading state by driver letter.
create function test.session_status(letter text) returns text language sql as $$
  -- The open session if there is one (several can share a created_at inside
  -- one test's transaction), otherwise the latest.
  select status::text from public.sessions
   where user_id = test.user_id(letter)
   order by status in ('active', 'matched') desc, created_at desc limit 1
$$;

create function test.credits(letter text) returns int language sql as $$
  select credits_balance from public.profiles where id = test.user_id(letter)
$$;

create function test.active_matches() returns bigint language sql as $$
  select count(*) from public.matches where status = 'active'
$$;

-- The permission tests run `set role authenticated`; they still need the helpers.
grant usage on schema test to authenticated;
grant execute on all functions in schema test to authenticated;
