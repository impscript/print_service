// Template Settings Service
// Stores quotation template settings in localStorage

export interface QuotationTemplateSettings {
    companyName: string;
    companyAddress: string;
    phone: string;
    fax: string;
    email: string;
    taxId: string;
    proposerName: string;
    proposerTitle: string;
    proposerPhone: string;
    defaultValidityDays: number;
    termsAndConditions: string[];
    notes: string[];
}

const STORAGE_KEY = 'quotation_template_settings';

// Default settings matching the current hardcoded values
const defaultSettings: QuotationTemplateSettings = {
    companyName: 'บริษัท ดั๊บเบิ้ล เอ ดิจิตอล ซินเนอร์จี จำกัด',
    companyAddress: '187/3 หมู่ 1 ถนนบางนา-ตราด กม.42 ตำบลบางวัว อำเภอบางปะกง จังหวัดฉะเชิงเทรา 24180',
    phone: '',
    fax: '',
    email: '',
    taxId: '',
    proposerName: 'ศรัญญา แดนไธสง',
    proposerTitle: 'ผู้นำเสนอโครงการ Double A Copy Point',
    proposerPhone: '0858353288',
    defaultValidityDays: 30,
    termsAndConditions: [
        'ชำระเงิน เครดิต 30 วัน หลังจากวางบิล',
        'ส่งมอบสินค้า ภายใน 60 วันหลังจากรับของเครื่อง',
        'ราคาที่นำเสนอนี้ ไม่รวมภาษีมูลค่าเพิ่ม 7%',
        'ระยะเวลาสัญญา 36 เดือน',
        'ส่วนลดกระดาษเสีย จากปริมาณการใช้งาน จำนวน 3.00% ต่อเดือน',
        'บริษัทฯ เป็นผู้รับผิดชอบวัสดุสิ้นเปลือง ได้แก่ ผงหมึกดำ อะไหล่ บริการ และกระดาษ Double A A4 80 g.'
    ],
    notes: [
        'รายละเอียดเครื่องตามเอกสารแนบ',
        'กรณีเพิ่มเครื่องถ่ายเอกสารในระหว่างระยะเวลาสัญญา',
    ]
};

export const templateSettingsService = {
    /**
     * Get template settings from localStorage
     */
    get(): QuotationTemplateSettings {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...defaultSettings, ...JSON.parse(stored) };
            }
            return defaultSettings;
        } catch (e) {
            console.error('Error loading template settings:', e);
            return defaultSettings;
        }
    },

    /**
     * Save template settings to localStorage
     */
    save(settings: Partial<QuotationTemplateSettings>): void {
        try {
            const current = this.get();
            const updated = { ...current, ...settings };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Error saving template settings:', e);
        }
    },

    /**
     * Reset to default settings
     */
    reset(): void {
        localStorage.removeItem(STORAGE_KEY);
    },

    /**
     * Get default settings
     */
    getDefaults(): QuotationTemplateSettings {
        return { ...defaultSettings };
    }
};
