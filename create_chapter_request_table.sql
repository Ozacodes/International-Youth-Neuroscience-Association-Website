-- Create chapter_request table
CREATE TABLE IF NOT EXISTS chapter_request (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by INTEGER,
    admin_notes TEXT,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chapter_request_user_id ON chapter_request(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_request_status ON chapter_request(status);
CREATE INDEX IF NOT EXISTS idx_chapter_request_requested_at ON chapter_request(requested_at);
CREATE INDEX IF NOT EXISTS idx_chapter_request_school_name ON chapter_request(school_name);

-- Insert sample data for testing
INSERT INTO chapter_request (
    user_id,
    user_name,
    user_email,
    school_name,
    reason,
    status,
    requested_at
) VALUES (
    1, -- Assuming user_id 1 exists (you'll need to replace with actual user_id)
    'John Doe',
    'john.doe@example.com',
    'Sample High School',
    'I want to start a neuroscience chapter at my school to engage students in brain research and create opportunities for hands-on learning experiences.',
    'pending',
    CURRENT_TIMESTAMP
);

-- Add comments to explain the table structure
COMMENT ON TABLE chapter_request IS 'Stores requests from users to start new IYNA chapters';
COMMENT ON COLUMN chapter_request.id IS 'Primary key for the chapter request';
COMMENT ON COLUMN chapter_request.user_id IS 'Foreign key to users table - the user making the request';
COMMENT ON COLUMN chapter_request.user_name IS 'Full name of the user at time of request';
COMMENT ON COLUMN chapter_request.user_email IS 'Email of the user at time of request';
COMMENT ON COLUMN chapter_request.school_name IS 'Name of the school where the chapter will be created';
COMMENT ON COLUMN chapter_request.reason IS 'User provided reason for wanting to start the chapter';
COMMENT ON COLUMN chapter_request.status IS 'Current status of the request: pending, approved, or rejected';
COMMENT ON COLUMN chapter_request.requested_at IS 'Timestamp when the request was made';
COMMENT ON COLUMN chapter_request.processed_at IS 'Timestamp when the request was processed by admin';
COMMENT ON COLUMN chapter_request.processed_by IS 'User ID of the admin who processed the request';
COMMENT ON COLUMN chapter_request.admin_notes IS 'Admin notes about the request (approval/rejection reasons)'; 