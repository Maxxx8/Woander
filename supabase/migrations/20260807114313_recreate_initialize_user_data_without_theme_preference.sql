/*
# Recreate initialize_user_data trigger function without theme_preference

## Purpose
The `on_auth_user_created` trigger calls `initialize_user_data()` when a new user signs up.
On the production database, this function may reference the `theme_preference` column which
does not exist there, causing error 42703 and preventing new user creation (and by extension,
admin login if the admin account is being created).

## Changes
- Recreates `initialize_user_data()` to INSERT only columns that exist in all environments:
  (user_id, display_name, avatar_url). No reference to theme_preference.
- The trigger itself (`on_auth_user_created`) is not modified — only the function it calls.

## Security
- Function remains SECURITY DEFINER with search_path = 'public', 'pg_catalog'.
- No RLS changes.
*/

CREATE OR REPLACE FUNCTION public.initialize_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_contributions (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in initialize_user_data: %', SQLERRM;
    RETURN NEW;
END;
$function$;
