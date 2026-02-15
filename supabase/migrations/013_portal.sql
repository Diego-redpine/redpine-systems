-- Migration 013: Portal support
-- Adds 'portal' to site_projects project_type constraint
-- Adds parent_email field to clients for multi-student portal support

-- Allow 'portal' project type
ALTER TABLE site_projects DROP CONSTRAINT IF EXISTS site_projects_project_type_check;
ALTER TABLE site_projects ADD CONSTRAINT site_projects_project_type_check
  CHECK (project_type IN ('website', 'link_tree', 'portal'));

-- Parent linking field for multi-student portals
ALTER TABLE clients ADD COLUMN IF NOT EXISTS parent_email TEXT;
CREATE INDEX IF NOT EXISTS idx_clients_parent_email ON clients(parent_email);
