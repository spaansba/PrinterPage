-- Custom SQL migration file, put you code below! --
-- First rename the existing updatedAt column to updated_at
ALTER TABLE printer_printers 
RENAME COLUMN "updatedAt" TO updated_at;

-- Then rename name to internal_name
ALTER TABLE printer_printers 
RENAME COLUMN name TO internal_name;

-- Add new columns
ALTER TABLE printer_printers 
ADD COLUMN name VARCHAR(256),
ADD COLUMN profile_picture VARCHAR(512);

-- Now modify updated_at column
ALTER TABLE printer_printers 
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN updated_at SET NOT NULL;


