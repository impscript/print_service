-- Add missing contract fields based on ไฟล์ควบคุมสัญญา.xlsx analysis

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS paper_included boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS paper_gram integer DEFAULT 80,
  ADD COLUMN IF NOT EXISTS vat_included boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS old_contract_number text;

-- Add comment descriptions
COMMENT ON COLUMN contracts.paper_included IS 'กระดาษรวมในสัญญา (true = รวม, false = ไม่รวม)';
COMMENT ON COLUMN contracts.paper_gram IS 'แกรมกระดาษ (70 or 80)';
COMMENT ON COLUMN contracts.vat_included IS 'ราคารวม VAT (true = รวม, false = ก่อนภาษี)';
COMMENT ON COLUMN contracts.old_contract_number IS 'เลขที่สัญญาเก่า (กรณีต่อสัญญา)';
