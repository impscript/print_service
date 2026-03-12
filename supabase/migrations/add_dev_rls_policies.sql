-- Add permissive RLS policies for development
-- Run this in Supabase Dashboard > SQL Editor

-- Customers table policies
DROP POLICY IF EXISTS "dev_customers_insert" ON customers;
DROP POLICY IF EXISTS "dev_customers_select" ON customers;
DROP POLICY IF EXISTS "dev_customers_update" ON customers;
DROP POLICY IF EXISTS "dev_customers_delete" ON customers;

CREATE POLICY "dev_customers_select" ON customers FOR SELECT USING (true);
CREATE POLICY "dev_customers_insert" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "dev_customers_update" ON customers FOR UPDATE USING (true);
CREATE POLICY "dev_customers_delete" ON customers FOR DELETE USING (true);

-- Leads table policies  
DROP POLICY IF EXISTS "dev_leads_insert" ON leads;
DROP POLICY IF EXISTS "dev_leads_select" ON leads;
DROP POLICY IF EXISTS "dev_leads_update" ON leads;
DROP POLICY IF EXISTS "dev_leads_delete" ON leads;

CREATE POLICY "dev_leads_select" ON leads FOR SELECT USING (true);
CREATE POLICY "dev_leads_insert" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "dev_leads_update" ON leads FOR UPDATE USING (true);
CREATE POLICY "dev_leads_delete" ON leads FOR DELETE USING (true);
