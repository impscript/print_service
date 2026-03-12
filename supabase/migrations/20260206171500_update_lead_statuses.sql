-- Add new lead statuses to enum
-- Migration file created at 2026-02-06 17:15:00

DO $$
BEGIN
    ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'mkt_matching';
    ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'quotation';
    ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'pr';
    ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'po';
    ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'contract';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
