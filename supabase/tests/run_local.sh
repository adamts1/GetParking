#!/bin/sh
# Runs the migrations + logic tests against a throwaway Postgres (PostGIS required).
# Supabase-only pieces (auth, realtime, pg_cron) are stubbed in local_stubs.sql.
# Any failed assertion stops the run with a non-zero exit code.
set -e
cd "$(dirname "$0")/.."
DB=parking_test
dropdb --if-exists $DB; createdb $DB
psql -q -d $DB -c "create schema extensions" -c "create extension postgis with schema extensions"
sed '1s/create schema extensions; //' tests/local_stubs.sql | psql -q -d $DB -v ON_ERROR_STOP=1
for f in migrations/*.sql; do grep -v 'create extension if not exists pg_cron' "$f" | psql -q -d $DB -v ON_ERROR_STOP=1 >/dev/null; done
psql -q -d $DB -v ON_ERROR_STOP=1 -f tests/helpers.sql
for f in tests/*.test.sql; do
  echo "── $f"
  # No pipe: psql's own exit status must reach `set -e`, or a failed
  # assertion would be reported as a pass.
  psql -q -d $DB -v ON_ERROR_STOP=1 -f "$f"
done
