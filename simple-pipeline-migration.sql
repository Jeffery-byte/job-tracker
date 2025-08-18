-- Simple Pipeline Migration - Step 1
-- Add basic pipeline_stage column to your existing applications table

-- Add the pipeline_stage column (will default to 'Applied' for new records)
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'Applied';

-- Copy existing status values to pipeline_stage for backward compatibility
UPDATE applications 
SET pipeline_stage = COALESCE(status, 'Applied')
WHERE pipeline_stage IS NULL OR pipeline_stage = 'Applied';

-- Add stage_changed_date column to track when stage last changed
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS stage_changed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Set stage_changed_date to applied_date for existing records, or created_at as fallback
UPDATE applications 
SET stage_changed_date = COALESCE(applied_date, created_at, CURRENT_TIMESTAMP)
WHERE stage_changed_date IS NULL;

-- Add optional fields for enhanced tracking (these can be NULL)
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS expected_next_step TEXT,
ADD COLUMN IF NOT EXISTS interview_notes JSONB DEFAULT '{}';

-- Create a simple index for better performance
CREATE INDEX IF NOT EXISTS idx_applications_pipeline_stage ON applications(pipeline_stage);
