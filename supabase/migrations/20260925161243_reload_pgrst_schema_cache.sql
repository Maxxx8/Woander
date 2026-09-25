/*
# Reload PostgREST schema cache

The `place_attributes` and `evidence_labels` columns were added to
`hidden_gems` but the PostgREST schema cache hasn't picked them up,
causing insert failures with "Could not find the column" errors.

This migration issues a NOTIFY to reload the schema cache so the
new columns become visible to the Data API.
*/

NOTIFY pgrst, 'reload schema';
