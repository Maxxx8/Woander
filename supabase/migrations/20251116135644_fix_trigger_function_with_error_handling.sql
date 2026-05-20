/*
  # Fix Trigger Function with Better Error Handling

  ## Issue
  The trigger function may be failing silently. Need to add error handling
  and ensure it properly creates records.

  ## Solution
  - Recreate trigger function with explicit error handling
  - Use exception handling to catch and log errors
  - Make function more robust with NULL checks

  ## Security
  - Maintains SECURITY DEFINER for bypassing RLS
  - Preserves ON CONFLICT handling for idempotency
*/

-- Drop and recreate the trigger function with better error handling
DROP FUNCTION IF EXISTS initialize_user_data() CASCADE;

CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the trigger execution
  RAISE NOTICE 'Initializing user data for user_id: %', NEW.id;

  -- Create user profile with error handling
  BEGIN
    INSERT INTO public.user_profiles (user_id, display_name, joined_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
      NEW.created_at
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'user_profiles created for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating user_profile for user_id %: % %', NEW.id, SQLERRM, SQLSTATE;
    RAISE;
  END;

  -- Create user contributions record with error handling
  BEGIN
    INSERT INTO public.user_contributions (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'user_contributions created for user_id: %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating user_contributions for user_id %: % %', NEW.id, SQLERRM, SQLSTATE;
    RAISE;
  END;

  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_data();
