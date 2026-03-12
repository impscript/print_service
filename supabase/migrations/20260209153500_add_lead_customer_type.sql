-- Create the enum for customer acquisition type
CREATE TYPE lead_customer_acquisition_type AS ENUM ('existing_add', 'existing_replace', 'new_demo');

-- Add columns to leads table
ALTER TABLE leads 
ADD COLUMN customer_acquisition_type lead_customer_acquisition_type,
ADD COLUMN price_validity_days INTEGER DEFAULT 30;

-- Comment on columns
COMMENT ON COLUMN leads.customer_acquisition_type IS 'ประเภทลูกค้า: ลูกค้าปัจจุบัน-เพิ่มเครื่อง, ลูกค้าปัจจุบัน-เปลี่ยนเครื่อง, ลูกค้าใหม่-Demo';
COMMENT ON COLUMN leads.price_validity_days IS 'กำหนดยืนราคา (วัน)';
