\set ON_ERROR_STOP 1
insert into auth.users (id) values ('00000000-0000-0000-0000-00000000000a'),('00000000-0000-0000-0000-00000000000b'),('00000000-0000-0000-0000-00000000000c');
-- vehicles
insert into vehicles (user_id, make_model, color, plate_last_digits) select id, 'Mazda 3', 'לבן', '12' from profiles;
update profiles p set active_vehicle_id = v.id, nickname = right(p.id::text,1) from vehicles v where v.user_id = p.id;
select id, credits_balance from profiles;
-- A leaves at TLV point
set test.uid = '00000000-0000-0000-0000-00000000000a';
select start_leave(32.0800, 34.7800, 10) is not null as leave_started;
-- B searches 500m away -> immediate match
set test.uid = '00000000-0000-0000-0000-00000000000b';
select start_search(32.0845, 34.7800, 10) is not null as search_started;
select status, count(*) from matches group by 1;
select get_active_state() -> 'match' ->> 'role' as b_role, get_active_state() -> 'match' -> 'counterpart' as cp;
-- too far
do $$ begin perform confirm_parked((select id from matches)); raise exception 'should fail'; exception when others then raise notice 'confirm far: %', sqlerrm; end $$;
-- B arrives
select update_location(32.0801, 34.7800, 8);
set test.uid = '00000000-0000-0000-0000-00000000000a';
select update_location(32.0800, 34.7800, 8);
set test.uid = '00000000-0000-0000-0000-00000000000b';
select confirm_parked((select id from matches)) as b_balance;
select right(user_id::text,1) u, kind, status from sessions order by 1;
select right(id::text,1) u, credits_balance from profiles order by 1;
-- cancel-after-match requeue: A leaves again, B and C search, B gets matched, A cancels -> no; B cancels -> C? 
set test.uid = '00000000-0000-0000-0000-00000000000a';
select start_leave(32.0800, 34.7800, 10);
set test.uid = '00000000-0000-0000-0000-00000000000b';
select start_search(32.0810, 34.7800, 10);
set test.uid = '00000000-0000-0000-0000-00000000000c';
select start_search(32.0820, 34.7800, 10);
select right(user_id::text,1) u, kind, status from sessions where status in ('active','matched') order by 1;
set test.uid = '00000000-0000-0000-0000-00000000000b';
select cancel_active();
select right(user_id::text,1) u, kind, status from sessions where ended_at is null or status='cancelled' order by created_at desc limit 4;
select status, right(searcher_id::text,1) s, right(leaver_id::text,1) l from matches order by created_at;
-- expiry
update matches set expires_at = now() - interval '1s' where status='active';
select expire_and_sweep();
select status, count(*) from matches group by 1;
select right(user_id::text,1) u, status from sessions order by created_at desc limit 3;
-- insufficient credits
update profiles set credits_balance = 0 where id = '00000000-0000-0000-0000-00000000000c';
set test.uid = '00000000-0000-0000-0000-00000000000c';
do $$ begin perform start_search(32.08, 34.78, 5); exception when others then raise notice 'no credits: %', sqlerrm; end $$;
-- authenticated cannot call internal fn
set role authenticated;
do $$ begin perform try_match(gen_random_uuid()); exception when others then raise notice 'grant check: %', sqlerrm; end $$;
