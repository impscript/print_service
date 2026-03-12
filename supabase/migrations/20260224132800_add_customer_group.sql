-- Add customer_group column to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS customer_group text;
