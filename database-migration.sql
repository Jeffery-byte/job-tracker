-- Enhanced Job Tracker Pipeline Database Schema
-- Migration script to upgrade from simple status to detailed pipeline

-- Add new columns to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'Applied',
ADD COLUMN IF NOT EXISTS stage_changed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS interview_notes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expected_next_step TEXT,
ADD COLUMN IF NOT EXISTS stage_history JSONB DEFAULT '[]';

-- Add computed column for pipeline phase (PostgreSQL 12+)
-- If your PostgreSQL version doesn't support generated columns, you can skip this
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS pipeline_phase TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN pipeline_stage IN ('Applied', 'Application Under Review', 'Application Rejected') THEN 'application'
    WHEN pipeline_stage IN ('Phone Screen Scheduled', 'Phone Screen Completed', 'Technical Interview Scheduled', 'Technical Interview Completed', 'Onsite/Final Interview Scheduled', 'Final Interview Completed') THEN 'interview'
    WHEN pipeline_stage IN ('Reference Check', 'Offer Negotiation', 'Offer Accepted', 'Offer Declined', 'Rejected After Interview') THEN 'decision'
    ELSE 'other'
  END
) STORED;

-- Migrate existing status data to new pipeline_stage
UPDATE applications 
SET pipeline_stage = CASE 
  WHEN status = 'Applied' THEN 'Applied'
  WHEN status = 'Interview' THEN 'Phone Screen Scheduled'
  WHEN status = 'Offer' THEN 'Offer Negotiation'
  WHEN status = 'Rejected' THEN 'Application Rejected'
  WHEN status = 'Withdrawn' THEN 'Withdrawn by Candidate'
  ELSE 'Applied'
END
WHERE pipeline_stage IS NULL OR pipeline_stage = 'Applied';

-- Initialize stage_history for existing records
UPDATE applications 
SET stage_history = jsonb_build_array(
  jsonb_build_object(
    'stage', pipeline_stage,
    'date', COALESCE(applied_date, created_at),
    'notes', 'Migrated from old status system'
  )
)
WHERE stage_history = '[]'::jsonb OR stage_history IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_pipeline_stage ON applications(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_applications_pipeline_phase ON applications(pipeline_phase);
CREATE INDEX IF NOT EXISTS idx_applications_stage_changed_date ON applications(stage_changed_date);

-- Create function to automatically update stage_changed_date
CREATE OR REPLACE FUNCTION update_stage_changed_date()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.pipeline_stage IS DISTINCT FROM NEW.pipeline_stage THEN
    NEW.stage_changed_date = CURRENT_TIMESTAMP;
    
    -- Add to stage history
    NEW.stage_history = COALESCE(OLD.stage_history, '[]'::jsonb) || 
      jsonb_build_array(
        jsonb_build_object(
          'stage', NEW.pipeline_stage,
          'date', CURRENT_TIMESTAMP,
          'notes', COALESCE(NEW.notes, ''),
          'previous_stage', OLD.pipeline_stage
        )
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_stage_changed_date_trigger ON applications;
CREATE TRIGGER update_stage_changed_date_trigger
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_stage_changed_date();

-- You can keep the old status column for now as backup, or drop it later
-- ALTER TABLE applications DROP COLUMN status;
