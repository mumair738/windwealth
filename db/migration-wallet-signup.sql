-- ============================================================================
-- Migration: Make password_hash and email nullable for wallet-based signups
-- ============================================================================
-- This migration allows users to sign up with just a wallet address
-- without requiring email or password.
--
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- Make password_hash nullable (wallet accounts don't have passwords)
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Make email nullable (wallet accounts use placeholder emails)
ALTER TABLE users 
ALTER COLUMN email DROP NOT NULL;

-- Verify the changes
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('password_hash', 'email');
