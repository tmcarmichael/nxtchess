-- Migration: Add profile_icon column to profiles table
-- Date: 2026-01-21

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_icon TEXT DEFAULT 'white-pawn';
