ALTER TABLE printer_printers 
RENAME COLUMN name TO internal_name;

ALTER TABLE printer_printers 
ADD COLUMN name VARCHAR(256),
ADD COLUMN profile_picture VARCHAR(512);

ALTER TABLE printer_printers 
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN updated_at SET NOT NULL;