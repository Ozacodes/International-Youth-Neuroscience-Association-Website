-- SQL script to add file_urls column to user_task_completions table
-- Run this in your Supabase SQL editor

-- Add the file_urls column
ALTER TABLE user_task_completions 
ADD COLUMN IF NOT EXISTS file_urls TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN user_task_completions.file_urls IS 'Comma-separated list of file URLs uploaded as evidence';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_task_completions' 
AND column_name = 'file_urls';

-- Optional: Show the updated table structure
\d user_task_completions; 