-- ---------------------------------------------------------------------------
-- 0. CLEANUP (Run this if you have old tables from the previous script)
-- ---------------------------------------------------------------------------
-- Drop tables in reverse order of dependency to avoid errors.
DROP TABLE IF EXISTS note_edits;
DROP TABLE IF EXISTS note_permissions;
DROP TABLE IF EXISTS notes;
-- Drop the old function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column;


-- ---------------------------------------------------------------------------
-- 1. TABLE CREATION
-- ---------------------------------------------------------------------------

-- Create the notes table to store note content and ownership information.
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the note_permissions table to manage who can access or edit notes.
-- We are adding note_owner_id to break the RLS recursion.
CREATE TABLE note_permissions (
  id BIGSERIAL PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Duplicated for RLS
  can_edit BOOLEAN DEFAULT false,
  UNIQUE(note_id, user_id)
);

-- Create the note_edits table for version tracking of changes.
CREATE TABLE note_edits (
  id BIGSERIAL PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES auth.users(id),
  old_content TEXT,
  new_content TEXT,
  edited_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 1A. NOTE GROUPS (FOLDERS) TABLE
-- ---------------------------------------------------------------------------

-- Create the note_groups table for hierarchical organization of notes.
CREATE TABLE note_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_group_id UUID REFERENCES note_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add group_id to notes (nullable, can be ungrouped)
ALTER TABLE notes ADD COLUMN group_id UUID REFERENCES note_groups(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS & TRIGGERS
-- ---------------------------------------------------------------------------

-- Create a function to automatically update the updated_at timestamp on note changes.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to execute the function whenever a note is updated.
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- Function to populate note_owner_id in note_permissions
CREATE OR REPLACE FUNCTION public.populate_note_owner_id()
RETURNS TRIGGER AS $$
BEGIN
    -- On insert of a new permission, copy the owner_id from the parent note.
    SELECT owner_id INTO NEW.note_owner_id
    FROM notes
    WHERE id = NEW.note_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to populate note_owner_id before a permission is inserted.
CREATE TRIGGER populate_owner_on_permission_insert
BEFORE INSERT ON note_permissions
FOR EACH ROW
EXECUTE FUNCTION public.populate_note_owner_id();


-- ---------------------------------------------------------------------------
-- 3. ROW-LEVEL SECURITY (RLS)
-- ---------------------------------------------------------------------------

-- Enable RLS on all relevant tables.
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_edits ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners as well (best practice).
ALTER TABLE notes FORCE ROW LEVEL SECURITY;
ALTER TABLE note_permissions FORCE ROW LEVEL SECURITY;
ALTER TABLE note_edits FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- POLICIES FOR 'notes' TABLE
-- ---------------------------------------------------------------------------

-- Users can see their own notes or notes that have been shared with them.
CREATE POLICY "Users can see their own notes or notes shared with them"
ON notes FOR SELECT
USING (
  auth.uid() = owner_id OR
  EXISTS (
    SELECT 1 FROM note_permissions
    WHERE note_permissions.note_id = notes.id AND note_permissions.user_id = auth.uid()
  )
);

-- Users can create new notes for themselves.
CREATE POLICY "Users can create notes for themselves"
ON notes FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Users can update their own notes or notes where they have edit permission.
CREATE POLICY "Users can update their own notes or notes shared with edit permission"
ON notes FOR UPDATE
USING (
  auth.uid() = owner_id OR
  EXISTS (
    SELECT 1 FROM note_permissions
    WHERE note_permissions.note_id = notes.id AND note_permissions.user_id = auth.uid() AND note_permissions.can_edit = true
  )
);

-- Only the original owner can delete their notes.
CREATE POLICY "Users can delete their own notes"
ON notes FOR DELETE
USING (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- POLICIES FOR 'note_permissions' TABLE (NON-RECURSIVE)
-- ---------------------------------------------------------------------------

-- Users can see permissions for notes they own OR permissions granted to them.
-- This policy is now self-contained and does NOT refer back to the 'notes' table.
CREATE POLICY "Users can see permissions they are involved in"
ON note_permissions FOR SELECT
USING (
    auth.uid() = user_id OR -- The user the permission is for
    auth.uid() = note_owner_id -- The owner of the note
);

-- Note owners can grant permissions to other users.
CREATE POLICY "Owners can grant permissions on their notes"
ON note_permissions FOR INSERT
WITH CHECK (
    auth.uid() = note_owner_id
);

-- Users can only delete permissions on notes they own.
CREATE POLICY "Owners can revoke permissions on their notes"
ON note_permissions FOR DELETE
USING (
    auth.uid() = note_owner_id
);


-- ---------------------------------------------------------------------------
-- POLICIES FOR 'note_edits' TABLE
-- ---------------------------------------------------------------------------

-- Users can see the version history for notes they have access to.
-- This policy is safe because the 'notes' select policy does not recurse.
CREATE POLICY "Users can see edits on notes they have access to"
ON note_edits FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM notes
        WHERE notes.id = note_edits.note_id -- The RLS policy on 'notes' will be applied here.
    )
);

-- ---------------------------------------------------------------------------
-- 3A. RLS FOR NOTE GROUPS
-- ---------------------------------------------------------------------------
ALTER TABLE note_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_groups FORCE ROW LEVEL SECURITY;

-- Users can see their own groups
CREATE POLICY "Users can see their own groups"
ON note_groups FOR SELECT
USING (auth.uid() = owner_id);

-- Users can create groups for themselves
CREATE POLICY "Users can create groups for themselves"
ON note_groups FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Users can update their own groups
CREATE POLICY "Users can update their own groups"
ON note_groups FOR UPDATE
USING (auth.uid() = owner_id);

-- Users can delete their own groups
CREATE POLICY "Users can delete their own groups"
ON note_groups FOR DELETE
USING (auth.uid() = owner_id);