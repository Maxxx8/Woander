/*
  # Security Fix: Add Missing Foreign Key Indexes (Part 1)

  1. Issue: Unindexed Foreign Keys
    - Multiple tables have foreign keys without covering indexes
    - This causes suboptimal query performance

  2. Solution: Add Indexes
    - Create indexes on all foreign key columns
    - Improves JOIN performance and query optimization
    - Reduces database load on related queries

  ## Added Indexes:
  - admin_invitations.invited_by
  - admin_role_permissions.permission_key
  - admin_users.invited_by
  - gem_comments.user_id
  - gem_visits.user_id
  - property_listings.approved_by
  - property_reviews.booking_id
  - quotes_library.background_media_id
*/

-- Add index for admin_invitations.invited_by foreign key
CREATE INDEX IF NOT EXISTS idx_admin_invitations_invited_by
  ON admin_invitations(invited_by);

-- Add index for admin_role_permissions.permission_key foreign key
CREATE INDEX IF NOT EXISTS idx_admin_role_permissions_permission_key
  ON admin_role_permissions(permission_key);

-- Add index for admin_users.invited_by foreign key
CREATE INDEX IF NOT EXISTS idx_admin_users_invited_by
  ON admin_users(invited_by);

-- Add index for gem_comments.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_gem_comments_user_id
  ON gem_comments(user_id);

-- Add index for gem_visits.user_id foreign key (note: different from existing idx_gem_visits_user_id if it exists)
CREATE INDEX IF NOT EXISTS idx_gem_visits_user_id_fkey
  ON gem_visits(user_id);

-- Add index for property_listings.approved_by foreign key
CREATE INDEX IF NOT EXISTS idx_property_listings_approved_by
  ON property_listings(approved_by);

-- Add index for property_reviews.booking_id foreign key
CREATE INDEX IF NOT EXISTS idx_property_reviews_booking_id
  ON property_reviews(booking_id);

-- Add index for quotes_library.background_media_id foreign key
CREATE INDEX IF NOT EXISTS idx_quotes_library_background_media_id
  ON quotes_library(background_media_id);
