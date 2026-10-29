-- ============================================================
-- Fix for tables already created from an older schema.sql.
-- Adds columns the backend uses that were missing.
-- Safe to run multiple times (IF NOT EXISTS). Run in Supabase SQL Editor.
-- ============================================================

ALTER TABLE "User"  ADD COLUMN IF NOT EXISTS salary DOUBLE PRECISION DEFAULT 0;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS note TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "staffId" INTEGER;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "staffName" TEXT;

ALTER TABLE "Table" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();
