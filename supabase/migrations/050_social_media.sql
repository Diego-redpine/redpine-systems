-- Migration 050: Social media enhancements
-- Adds multi-platform support (platforms array), media_urls, error_message to social_media_posts
-- Safe to re-run (all IF NOT EXISTS / IF EXISTS)

-- Add new columns to the existing social_media_posts table (from migration 021)
-- These extend the table to support multi-platform posting and richer media

-- platforms: array of platform names (replaces single 'platform' column for multi-platform posting)
ALTER TABLE social_media_posts ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT '{}';

-- media_urls: array of media attachment URLs
ALTER TABLE social_media_posts ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

-- error_message: stores failure reason when status = 'failed'
ALTER TABLE social_media_posts ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Backfill platforms array from existing single-platform column
UPDATE social_media_posts
SET platforms = ARRAY[platform]
WHERE platforms = '{}' AND platform IS NOT NULL AND platform != '';

-- Composite index for user + status queries (used by dashboard listing)
CREATE INDEX IF NOT EXISTS idx_social_posts_user_status
  ON social_media_posts(user_id, status);

-- Partial index for scheduled posts (used by scheduler cron)
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled
  ON social_media_posts(scheduled_at)
  WHERE status = 'scheduled';
