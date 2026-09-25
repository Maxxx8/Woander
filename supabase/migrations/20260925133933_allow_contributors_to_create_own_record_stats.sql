/*
# Allow contribution stats to be created after a Worthy Place submission

1. Purpose
   A successful place submission also creates the contributor's record
   summary when they submit for the first time. The existing table had
   a read policy and an update policy, but no insert policy, so that
   follow-up operation was rejected.

2. Security
   - Add one authenticated INSERT policy on `user_contributions`.
   - A contributor may create only the row whose `user_id` matches their
     authenticated account.
   - No public or cross-user write access is added.

3. Data Safety
   This migration only adds a missing permission policy. It does not
   alter or remove any rows, columns, or existing policies.
*/

DROP POLICY IF EXISTS "Users can create their own contribution profile" ON user_contributions;
CREATE POLICY "Users can create their own contribution profile"
ON user_contributions FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));
