-- 033: Add queue tracking columns to waitlist for Live Board "Now Serving" feature
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS queue_number INTEGER;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS queue_date DATE DEFAULT CURRENT_DATE;
CREATE INDEX IF NOT EXISTS idx_waitlist_queue ON waitlist(user_id, queue_date, queue_number);
