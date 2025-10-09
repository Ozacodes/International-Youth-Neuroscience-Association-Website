# File Upload and Viewing Setup Guide

## Overview

This guide will help you set up file upload and viewing functionality for point requests in your IYNA admin dashboard. Users can now upload files as evidence when submitting point requests, and admins can view/download these files in the admin dashboard.

## 1. Database Setup

### Step 1: Add the `file_urls` column to your `user_task_completions` table

In your Supabase SQL editor, run this migration:

```sql
-- Add file_urls column to store comma-separated file URLs
ALTER TABLE user_task_completions 
ADD COLUMN file_urls TEXT;

-- Add comment for documentation
COMMENT ON COLUMN user_task_completions.file_urls IS 'Comma-separated list of file URLs uploaded as evidence';
```

### Step 2: Set up Storage Bucket Policies

In your Supabase dashboard, go to Storage > Policies and add these policies for your `image-test` bucket:

```sql
-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'image-test');

-- Policy to allow public read access to files
CREATE POLICY "Allow public downloads" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'image-test');

-- Policy to allow users to delete their own files (optional)
CREATE POLICY "Allow users to delete own files" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'image-test' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 2. Features Implemented

### For Users (Chapter Dashboard)
- **File Upload**: Users can drag & drop or click to upload files when submitting point requests
- **File Types Supported**: Images, PDFs, documents, videos, audio files, and more
- **File Size Limit**: 10MB per file (configurable)
- **Multiple Files**: Users can upload multiple files per request
- **Visual Feedback**: Files show with appropriate icons and upload status

### For Admins (Admin Dashboard)
- **File Viewing**: Admins can view uploaded files directly in the browser
- **File Download**: Download files to local system
- **File Preview**: 
  - Images: Full preview with zoom
  - PDFs: Embedded viewer
  - Other files: Download prompt with file type icon
- **Professional UI**: Clean, modal-based viewing experience

## 3. File Storage Structure

Files are stored in Supabase Storage with this structure:
```
image-test/
└── point-requests/
    ├── {userId}_{timestamp}_{randomId}.pdf
    ├── {userId}_{timestamp}_{randomId}.jpg
    └── ...
```

## 4. Testing the Implementation

### Step 1: Test File Upload
1. Go to Chapter Dashboard
2. Click "Request Points" on any task
3. Fill out the evidence text
4. Try uploading a file (drag & drop or click the upload area)
5. Submit the request

### Step 2: Test File Viewing in Admin Dashboard
1. Go to Admin Dashboard
2. Navigate to "Point Requests" tab
3. Look for requests with "Attached Files" section
4. Click "View" to preview files
5. Click "Download" to download files

## 5. Troubleshooting

### If files don't appear in admin dashboard:
1. Check browser console for errors
2. Verify the `file_urls` column exists in database
3. Check Supabase Storage policies
4. Ensure the bucket name matches ("image-test")

### If uploads fail:
1. Check file size (must be under 10MB)
2. Verify Supabase Storage policies allow uploads
3. Check browser console for specific error messages

### Database column check:
The system automatically checks if the `file_urls` column exists. Check the browser console for these messages:
- ✅ "File URLs column found"
- ⚠️ "file_urls column does not exist, please add it to your database"

## 6. File Type Icons

The system shows appropriate icons for different file types:
- 📄 PDF files
- 📊 Excel/Spreadsheet files
- 📝 Word documents
- 🖼️ Images (JPG, PNG, GIF, SVG)
- 🎵 Audio files (MP3, WAV)
- 🎬 Video files (MP4, AVI, MOV)
- 📦 Archive files (ZIP, RAR)
- 📄 Text files

## 7. Security Considerations

- Files are stored with unique names to prevent conflicts
- Public read access allows viewing without authentication
- Upload is restricted to authenticated users
- File size limits prevent abuse
- File type validation on frontend (add server-side validation as needed)

## 8. Next Steps (Optional Enhancements)

- Add server-side file type validation
- Implement file deletion for admins
- Add file compression for large images
- Create file usage analytics
- Add batch file download functionality

---

## Quick Test Checklist

- [ ] Database column `file_urls` added
- [ ] Storage bucket policies configured
- [ ] File upload works in chapter dashboard
- [ ] Files appear in admin dashboard
- [ ] File viewing modal opens properly
- [ ] File download works
- [ ] Error handling works for failed uploads

Your file upload and viewing system is now ready! Users can upload evidence files, and admins can easily view and download them from the admin dashboard. 