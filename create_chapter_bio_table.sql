-- Create table for chapter bios and social media links
-- This allows chapter directors to write descriptions about their chapters
-- and include links to their social media presence

CREATE TABLE chapter_bios (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL,
    chapter_name VARCHAR(255) NOT NULL,
    bio_text TEXT NOT NULL,
    social_media_links JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Foreign key constraints
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ensure unique chapter entries
    UNIQUE(chapter_id)
);

-- Create index for faster lookups
CREATE INDEX idx_chapter_bios_chapter_id ON chapter_bios(chapter_id);
CREATE INDEX idx_chapter_bios_active ON chapter_bios(is_active);

-- Add comments for documentation
COMMENT ON TABLE chapter_bios IS 'Stores chapter descriptions and social media links written by chapter directors';
COMMENT ON COLUMN chapter_bios.chapter_id IS 'Reference to the chapters table';
COMMENT ON COLUMN chapter_bios.chapter_name IS 'Name of the chapter for display purposes';
COMMENT ON COLUMN chapter_bios.bio_text IS 'Chapter description written by the director';
COMMENT ON COLUMN chapter_bios.social_media_links IS 'JSON object containing social media platform links';
COMMENT ON COLUMN chapter_bios.created_by IS 'User ID of the chapter director who created/updated the bio';
COMMENT ON COLUMN chapter_bios.is_active IS 'Whether this bio is currently active and visible';

-- Example of social_media_links JSON structure:
-- {
--   "instagram": "https://instagram.com/chapter_name",
--   "facebook": "https://facebook.com/chapter_name", 
--   "twitter": "https://twitter.com/chapter_name",
--   "linkedin": "https://linkedin.com/company/chapter_name",
--   "youtube": "https://youtube.com/@chapter_name",
--   "website": "https://chapter-website.com"
-- }

-- Insert sample data (optional - for testing)
INSERT INTO chapter_bios (chapter_id, chapter_name, bio_text, social_media_links, created_by) VALUES
(1, 'Sample Chapter', 'This is a sample chapter bio written by the chapter director. It describes the chapter''s mission, activities, and achievements.', 
'{"instagram": "https://instagram.com/sample_chapter", "facebook": "https://facebook.com/sample_chapter"}', 1);

-- Create a view for easy access to chapter bios with user information
CREATE VIEW chapter_bios_with_users AS
SELECT 
    cb.id,
    cb.chapter_id,
    cb.chapter_name,
    cb.bio_text,
    cb.social_media_links,
    cb.created_at,
    cb.updated_at,
    cb.is_active,
    u.email as director_email,
    u.first_name,
    u.last_name
FROM chapter_bios cb
JOIN users u ON cb.created_by = u.id
WHERE cb.is_active = TRUE;

-- Grant permissions (adjust as needed for your database setup)
-- GRANT SELECT, INSERT, UPDATE ON chapter_bios TO chapter_directors_role;
-- GRANT SELECT ON chapter_bios_with_users TO chapter_directors_role; 