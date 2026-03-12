-- Drop customer_group column from customers table
ALTER TABLE public.customers
DROP COLUMN IF NOT EXISTS customer_group;
