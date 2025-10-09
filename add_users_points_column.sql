-- SQL script to add points column to users table
-- Run this in your Supabase SQL editor if you want to enable user point tracking

-- Add the points column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Add a comment for documentation
COMMENT ON COLUMN users.points IS 'Total points earned by the user from completed tasks';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'points';

-- Optional: Show all columns in the users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position; 