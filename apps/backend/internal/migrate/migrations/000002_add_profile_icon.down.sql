-- Down migration: Remove profile_icon column
ALTER TABLE profiles DROP COLUMN IF EXISTS profile_icon;
