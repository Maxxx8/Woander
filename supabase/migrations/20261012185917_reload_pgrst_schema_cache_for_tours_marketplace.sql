/*
# Reload PostgREST schema cache for tours table

The marketplace migration added 20 new columns to the `tours` table, but
PostgREST's schema cache was not refreshed, causing insert errors like:
"Could not find the 'accommodation_type' column of 'tours' in the schema cache"

This migration forces a schema cache reload so all new columns are
immediately visible to the Supabase REST API.

No data or schema changes — just a cache refresh.
*/

NOTIFY pgrst, 'reload schema';
