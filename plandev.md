นี่คือไฟล์ plandev.md ที่สรุปข้อมูลจากเอกสารทั้งหมดและวิเคราะห์โครงสร้างระบบ เพื่อให้ทีม Developer (Full-stack) สามารถนำไปใช้พัฒนาต่อร่วมกับ AI ได้ทันทีครับ
--------------------------------------------------------------------------------
# Project Plan: DACP Backend Management System (Double A Copy Point)

## 1. Project Overview
ระบบบริหารจัดการงานหลังบ้าน (Backend Management System) สำหรับธุรกิจบริการเช่าและจำหน่ายเครื่องถ่ายเอกสาร/Printer เพื่อทดแทนกระบวนการทำงานเดิมที่กระจัดกระจาย (LINE, Google Sheets, Manual Paper) ให้เป็นระบบ Web Application แบบ Centralized ที่รองรับการทำงานแบบ Responsive (Mobile/Desktop)

**Objective:** เชื่อมต่อการทำงานของฝ่าย Sales, Marketing (MKT), Planner, Technician, และ Management เข้าด้วยกัน พร้อมระบบคำนวณราคาอัตโนมัติและระบบติดตามสถานะงาน

---

## 2. Tech Stack Recommendations (For AI Prompting)
*แนะนำให้ใช้ Stack ที่ AI มีความถนัดในการ Gen Code และจัดการ Logic ที่ซับซ้อนได้ดี*
*   **Frontend:** Next.js (React) หรือ Vue.js — เน้น Responsive Design (Tailwind CSS) เพื่อรองรับการใช้งานบนมือถือของ Sales และ Technician
*   **Backend:** Node.js (NestJS/Express) หรือ Python (FastAPI/Django) — รองรับ Logic การคำนวณราคาที่ซับซ้อน
*   **Database:** PostgreSQL Supabase — เหมาะสำหรับข้อมูลที่มีความสัมพันธ์ซับซ้อน (Relational Data) เช่น ลูกค้า 1 ราย มีหลาย Site, 1 Site มีหลายเครื่อง
*   **File Storage:** AWS S3 หรือ Google Cloud Storage หรือ Supabase Storage — สำหรับเก็บไฟล์สัญญา (PDF) และรูปถ่ายหน้างาน
*   **Authentication:** NextAuth หรือ Clerk (รองรับ Role-based Access Control)

---

## 3. User Roles & Workflows

### 3.1 Sales (Mobile/Tablet Focused)
*   **Pain Point เดิม:** ใช้ LINE ส่งข้อมูล ค้นหาประวัติยาก
*   **To-Be Features:**
    *   **Create Lead:** กรอกข้อมูล Requirement ลูกค้าผ่าน Web Form [Ref: 9, 43]
        *   ประเภทลูกค้า: Fast Print (ไม่มี Quote), Print Service (มี Quote)
        *   ข้อมูลเชิงเทคนิค: A4/A3, Printer Only/MFP, Color/Mono, Volume (แผ่น/รีม)
        *   Past Record: ยี่ห้อเดิม/กระดาษเดิม (เพื่อเทียบสเปก)
    *   **Status Tracking:** ติดตามสถานะใบเสนอราคา (Quotation) และ สัญญา (Contract)
    *   **Dashboard:** แจ้งเตือนสัญญาใกล้หมดอายุ (Renewal Alert)

### 3.2 Marketing (MKT) - (Desktop Focused)
*   **Pain Point เดิม:** Manual Quotation, ต้องจำสูตรราคาเอง
*   **To-Be Features:**
    *   **Ticket Receiver:** รับ Request จาก Sales
    *   **Quotation Engine:** เลือก Model เครื่อง (Kyocera, Lexmark, Canon, HP, Epson) และ Package -> ระบบคำนวณราคาและ Gen PDF อัตโนมัติ [Ref: 10]
    *   **Check Stock:** ตรวจสอบเครื่องว่าง (ใหม่/มือสอง) จากระบบ Inventory เบื้องต้น

### 3.3 Approver (Management/Khun Pichet)
*   **To-Be Features:**
    *   **Approval Dashboard:** อนุมัติราคาพิเศษ หรือ สัญญาเช่าใหม่
    *   **Notification:** แจ้งเตือนเมื่อมีเอกสารรออนุมัติ [Ref: 42]

### 3.4 Planner (Desktop Focused)
*   **To-Be Features:**
    *   **Job Assignment:** รับยอดจอง (Booking) -> จับคู่ Serial Number (S/N) -> จ่ายงานช่าง
    *   **Inventory Pivot:** ดูภาพรวม Stock เครื่อง (ระบุสถานะ: พร้อมใช้, รอซ่อม, จองแล้ว) แยกตามประเภท (New/Used) [Ref: 44]

### 3.5 Technician (Mobile First)
*   **Pain Point เดิม:** จดมิเตอร์ใส่กระดาษ, ลูกค้าไม่ส่งยอด, ข้อมูลหน้างานไม่ Real-time
*   **To-Be Features:**
    *   **Digital Job Sheet:** รับงานติดตั้ง/ซ่อมผ่านมือถือ
    *   **Installation:** สแกน QR Code เพื่อ Map `Machine Serial` เข้ากับ `Location` และ `Customer` [Ref: 45]
    *   **Meter Reading:** บันทึกเลขมิเตอร์รายเดือนผ่านมือถือ -> ระบบคำนวณบิลทันที -> ส่ง Email หา Office/ลูกค้า [Ref: 42]

---

## 4. Database Schema Guidelines (Key Entities)

### 4.1 Customers & Sites
*   **Customer:** `company_name`, `tax_id`, `contact_person`, `payment_terms` (Credit 30 Days) [Ref: 63]
*   **Sites:** เนื่องจากลูกค้า 1 รายอาจมีหลายสถานที่ติดตั้ง หรือหลายตึก (เช่น ศิริราช ตึก 1, ตึก 2) [Ref: 1, 5]
    *   *Relation:* 1 Customer -> Many Sites

### 4.2 Products & Machines
*   **Product Master:** `Brand` (Kyocera, Lexmark, etc.), `Model`, `Type` (Printer/MFP), `Speed` (ppm), `Spec` (Color/Mono, A3/A4)
*   **Asset/Item:** `Serial Number (S/N)`, `Status` (In Stock, Installed, Maintenance), `Condition` (New/Used), `Current_Counter`

### 4.3 Pricing Logic (Complex)
*ต้องออกแบบ Table ให้รองรับโครงสร้างราคา 4 รูปแบบหลัก:* [Ref: 46-61]
1.  **Minimum Guarantee:** การันตีขั้นต่ำ (แผ่น) ถ้าใช้ไม่ถึงจ่ายเหมา ถ้าเกินคิดต่อแผ่น
2.  **Rental + Click:** ค่าเช่าเครื่องคงที่ (บาท/เดือน) + ค่าแผ่นตามจริง (บาท/แผ่น)
3.  **Package (Paper Included):** เหมาจ่ายรวมกระดาษ (มีโควตาแผ่นฟรี) + ส่วนเกินคิดเงิน
4.  **Package (No Paper):** เหมาจ่ายไม่รวมกระดาษ

*   *Note:* มี Logic ส่วนลดกระดาษเสีย (Waste Paper Discount) 2% หรือ 3% ตามเงื่อนไขสัญญา [Ref: 14, 27, 68]

### 4.4 Contracts
*   `contract_number` (Running No.), `start_date`, `end_date` (36 months typical), `billing_cycle`, `status` (Active, Expired, Terminated)
*   ระบบแจ้งเตือนก่อนหมดสัญญา 30 วัน [Ref: 13, 26]

---

## 5. Functional Logic Detail (For AI Generation)

### 5.1 Quotation Generation Prompt Logic
> "Create a function to calculate monthly billing based on these inputs: Machine Model, Pricing Type (Min Guarantee/Rental/Package), Volume Black, Volume Color.
> *   If **Min Guarantee**: Check user volume vs Min tier. If User < Min, Bill = Min Price. Else Bill = (User Vol * Click Rate).
> *   If **Rental**: Bill = Fixed Rental Fee + (User Vol * Click Rate).
> *   If **Package**: Bill = Package Price + ((User Vol - Free Vol) * Excess Rate).
> *   Apply **Waste Paper Discount**: Deduct X% from Total Volume before calculating excess."

### 5.2 Field Service Installation Logic
> "On installation form submission:
> 1. Link `Machine_SN` to `Contract_ID` and `Site_ID`.
> 2. Update Machine Status to 'Installed'.
> 3. Record `Initial_Meter_Mono` and `Initial_Meter_Color`.
> 4. Generate 'Installation Acceptance Form' PDF for digital signature." [Ref: 5-7]

---

## 6. UI/UX Requirements
1.  **Responsive Dashboard:** เมนูต้องยุบได้ (Hamburger menu) เมื่อเปิดบนมือถือ
2.  **QR Code Scanner:** ในหน้า Technician ต้องเรียกใช้กล้องมือถือได้ผ่าน Browser
3.  **Search & Filter:** หน้า Sales/Stock ต้องมี Filter ละเอียด (แยก สี/ขาวดำ, A3/A4, ยี่ห้อ)
4.  **Notifications:** แจ้งเตือนภายใน App (Bell icon) และ Email

## 7. Reporting & Analytics
*   **Revenue Report:** แยกตามแผนก/ทีมขาย
*   **Stock Report:** เครื่องว่าง vs เครื่องติดตั้งแล้ว
*   **Machine Performance:** ประวัติการซ่อมและเปลี่ยนอะไหล่ (ดึงข้อมูลจาก Job Sheet ช่าง)