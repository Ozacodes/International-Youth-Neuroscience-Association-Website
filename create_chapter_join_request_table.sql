-- Create chapter_join_request table
CREATE TABLE IF NOT EXISTS chapter_join_request (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    chapter_id INTEGER NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_school VARCHAR(255),
    user_grade_level VARCHAR(50),
    join_reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by INTEGER,
    admin_notes TEXT,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance (PostgreSQL syntax)
CREATE INDEX IF NOT EXISTS idx_chapter_join_request_user_id ON chapter_join_request(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_join_request_chapter_id ON chapter_join_request(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_join_request_status ON chapter_join_request(status);
CREATE INDEX IF NOT EXISTS idx_chapter_join_request_requested_at ON chapter_join_request(requested_at);

-- Insert sample data for Matt Thamakaison
INSERT INTO chapter_join_request (
    user_id,
    chapter_id,
    user_name,
    user_email,
    user_school,
    user_grade_level,
    join_reason,
    status,
    requested_at
) VALUES (
    1, -- Assuming user_id 1 for Matt (you'll need to replace with actual user_id)
    (SELECT id FROM chapters WHERE chapter_code = 'THA005' LIMIT 1), -- Get chapter_id for THA005 chapter
    'Matt Thamakaison',
    'cryingcloud.th@gmail.com',
    'ISB', -- School name is ISB
    'Not specified',
    'I am passionate about neuroscience and want to contribute to the THA005 chapter. I hope to learn more about brain research and collaborate with other students interested in this field.',
    'pending',
    CURRENT_TIMESTAMP
);

-- Add comments to explain the table structure
COMMENT ON TABLE chapter_join_request IS 'Stores chapter join requests from users';
COMMENT ON COLUMN chapter_join_request.id IS 'Primary key for the join request';
COMMENT ON COLUMN chapter_join_request.user_id IS 'Foreign key to users table - the user making the request';
COMMENT ON COLUMN chapter_join_request.chapter_id IS 'Foreign key to chapters table - the chapter being requested to join';
COMMENT ON COLUMN chapter_join_request.user_name IS 'Full name of the user at time of request';
COMMENT ON COLUMN chapter_join_request.user_email IS 'Email of the user at time of request';
COMMENT ON COLUMN chapter_join_request.user_school IS 'School name of the user (optional)';
COMMENT ON COLUMN chapter_join_request.user_grade_level IS 'Grade level of the user (optional)';
COMMENT ON COLUMN chapter_join_request.join_reason IS 'User provided reason for wanting to join the chapter';
COMMENT ON COLUMN chapter_join_request.status IS 'Current status of the request: pending, approved, or rejected';
COMMENT ON COLUMN chapter_join_request.requested_at IS 'Timestamp when the request was made';
COMMENT ON COLUMN chapter_join_request.processed_at IS 'Timestamp when the request was processed by admin';
COMMENT ON COLUMN chapter_join_request.processed_by IS 'User ID of the admin who processed the request';
COMMENT ON COLUMN chapter_join_request.admin_notes IS 'Admin notes about the request (approval/rejection reasons)'; 