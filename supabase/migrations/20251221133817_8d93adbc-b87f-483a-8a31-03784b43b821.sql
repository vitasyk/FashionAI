-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create uploads bucket for user product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,  -- Private bucket
  10485760,  -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create outputs bucket for AI-generated images/videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'outputs',
  'outputs',
  false,  -- Private bucket
  52428800,  -- 50MB max for videos
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
);

-- =============================================
-- STORAGE POLICIES - UPLOADS BUCKET
-- =============================================

-- Path convention: uploads/{user_id}/{filename}

-- Users can view their own uploads
CREATE POLICY "Users can view own uploads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'uploads' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can upload to their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own uploads
CREATE POLICY "Users can update own uploads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- STORAGE POLICIES - OUTPUTS BUCKET
-- =============================================

-- Path convention: outputs/{user_id}/{job_id}/{filename}

-- Users can view their own outputs
CREATE POLICY "Users can view own outputs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'outputs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Only server (edge functions with service_role) can write to outputs
-- No INSERT/UPDATE/DELETE policies for authenticated users on outputs bucket
-- Edge functions bypass RLS with service_role key