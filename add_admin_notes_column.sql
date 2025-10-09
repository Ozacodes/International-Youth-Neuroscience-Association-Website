-- SQL script to add admin_notes column to user_task_completions table
-- Run this in your Supabase SQL editor if you want to enable admin notes functionality

-- Add the admin_notes column
ALTER TABLE user_task_completions 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN user_task_completions.admin_notes IS 'Admin notes about point request modifications';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_task_completions' 
AND column_name = 'admin_notes';

-- Optional: Show all columns in the updated table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_task_completions'
ORDER BY ordinal_position; 