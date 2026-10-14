#!/bin/sh
# Runs the migrations + scenario test against a throwaway local Postgres (PostGIS required).
# Supabase-only pieces (auth, realtime, pg_cron) are stubbed in local_stubs.sql.
set -e
cd "$(dirname "$0")/.."
DB=parking_test
dropdb --if-exists $DB; createdb $DB
psql -q -d $DB -c "create schema extensions" -c "create extension postgis with schema extensions"
sed '1s/create schema extensions; //' tests/local_stubs.sql | psql -q -d $DB -v ON_ERROR_STOP=1
for f in migrations/*.sql; do grep -v 'create extension if not exists pg_cron' "$f" | psql -q -d $DB -v ON_ERROR_STOP=1 >/dev/null; done
psql -d $DB -c "set search_path=public,extensions" -f tests/scenarios.sql
