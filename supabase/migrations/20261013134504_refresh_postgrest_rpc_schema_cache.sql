/*
# Refresh PostgREST RPC schema cache

1. Purpose
- Refreshes PostgREST's cached list of public functions so the newly created
  `insert_tour_package` RPC is available to the browser client.

2. Data Safety
- This migration changes no tables, columns, rows, policies, or function code.
- It only sends the supported schema-reload notification to PostgREST.

3. Security
- No permissions or access rules are changed.
*/

NOTIFY pgrst, 'reload schema';