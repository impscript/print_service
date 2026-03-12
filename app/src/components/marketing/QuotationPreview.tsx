import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { templateSettingsService, type QuotationTemplateSettings } from '@/services/templateSettings';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { formatCurrency, formatDate, formatNumber, getCustomerTypeLabel } from "@/lib/utils";
import type { Database } from "@/types/database";

type Quotation = Database['public']['Tables']['quotations']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type PricingPackage = Database['public']['Tables']['pricing_packages']['Row'];
type User = Database['public']['Tables']['users']['Row'];

interface ExtendedQuotation extends Quotation {
    customers: Customer | null;
    quotation_items: ({
        products: Product | null;
        total_price: number;
        description: string | null;
        quantity: number;
        unit_price: number;
    })[];
    pricing_packages: PricingPackage | null;
    users: User | null;
    sites?: any; // Added for quotation.sites type 
    leads?: any; // Added for quotation.leads type
}

interface QuotationPreviewProps {
    quotation: Partial<ExtendedQuotation> | null;
    isOpen: boolean;
    onClose: () => void;
    customTerms?: string;
}

export function QuotationPreview({ quotation, isOpen, onClose, customTerms }: QuotationPreviewProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [templateSettings, setTemplateSettings] = useState<QuotationTemplateSettings | null>(null);

    useEffect(() => {
        const settings = templateSettingsService.get();
        setTemplateSettings(settings);
    }, [isOpen]);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Quotation_${quotation?.quote_number || 'DRAFT'}`,
    });

    if (!quotation || !templateSettings) return null;

    // Helper to safety check nested objects
    const customer = quotation.customers || {} as Customer;
    const items = quotation.quotation_items || [];

    const validUntilDate = quotation.valid_until ? new Date(quotation.valid_until) : null;
    const createdDate = quotation.created_at ? new Date(quotation.created_at) : new Date();
    let priceValidityDays = 30;
    if (validUntilDate && createdDate) {
        const diffTime = Math.abs(validUntilDate.getTime() - createdDate.getTime());
        priceValidityDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Determine Project Name from leads.type
    const leadType = quotation.leads?.type;
    const projectName = leadType === 'print_service' ? 'Double A Copy Point' :
        leadType === 'fast_print' ? 'Double A Fastprint' : '';

    const subtotal = items.reduce((acc, item) => acc + (item.total_price || 0), 0);
    const discount = Number(quotation.discount || 0);
    const taxable = Math.max(0, subtotal - discount);
    const vat = taxable * 0.07;
    const total = taxable + vat;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-[210mm] p-0 gap-0 bg-white shadow-2xl">

                {/* No Print Header */}
                <div className="flex items-center justify-between p-4 border-b no-print bg-gray-50 sticky top-0 z-10">
                    <DialogTitle>Quotation Preview</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button onClick={handlePrint} size="sm" className="gap-2">
                            <Printer className="w-4 h-4" /> Print
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Printable Content - A4 Fixed Size */}
                <div className="print-content bg-white text-black text-[12px] font-serif leading-tight mx-auto" ref={printRef} style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>

                    {/* Header */}
                    <div className="mb-4">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4 items-start">
                                {/* Logo Placeholder */}
                                <div className="w-16 h-16 bg-blue-900 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
                                    <span className="italic">DA</span>
                                </div>
                                <div>
                                    <h1 className="font-bold text-lg text-black">{templateSettings.companyName}</h1>
                                    <p className="text-gray-600 text-[11px]" style={{ maxWidth: '420px' }}>
                                        {templateSettings.companyAddress}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-[12px] border border-black px-3 py-1.5 inline-flex gap-2">
                                    <span className="font-bold">เลขที่</span>
                                    <span>{quotation.quote_number || 'DRAFT'}</span>
                                </div>
                            </div>
                        </div>
                        {/* Document Number Row - below company address */}
                        <div className="text-center mt-4 mb-2">
                            <h2 className="text-[14px] font-bold">ใบเสนอราคาโครงการ {projectName || 'Double A copy Point'}</h2>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="flex justify-between mb-4 text-[12px]">
                        <div className="space-y-1 w-[60%]">
                            <div className="flex">
                                <span className="font-bold" style={{ minWidth: '80px' }}>เรียน</span>
                                <div>{quotation.attention_title || 'ผู้รับบริการ'} {customer.company_name}</div>
                            </div>
                            <div className="flex">
                                <span className="font-bold" style={{ minWidth: '80px' }}>ชื่อลูกค้า</span>
                                <div>{customer.contact_person || customer.company_name}</div>
                            </div>
                            <div className="flex">
                                <span className="font-bold" style={{ minWidth: '80px' }}>ที่อยู่</span>
                                <div>{customer.address || '-'}</div>
                            </div>
                            <div className="flex">
                                <span className="font-bold" style={{ minWidth: '80px' }}>โทรศัพท์</span>
                                <div>{customer.phone || '-'}</div>
                            </div>
                            <div className="flex">
                                <span className="font-bold" style={{ minWidth: '80px' }}>E-Mail</span>
                                <div>{customer.email || '-'}</div>
                            </div>
                        </div>

                        <div className="space-y-1 w-[35%]">
                            <div className="flex justify-between">
                                <span className="font-bold">วันที่</span>
                                <span className="w-32">{quotation.created_at ? formatDate(quotation.created_at) : formatDate(new Date().toISOString())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">ประเภทลูกค้า</span>
                                <span className="w-32">{((quotation as any).leads?.customer_acquisition_type === 'new_customer') ? 'ลูกค้าใหม่' : 'ลูกค้าปัจจุบัน'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">กลุ่มลูกค้า</span>
                                <span className="w-32">{customer.customer_type ? getCustomerTypeLabel(customer.customer_type) : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">กำหนดยืนยันราคา</span>
                                <span className="w-32">{priceValidityDays} วัน</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full border-collapse border border-black text-[11px] mb-2">
                        <thead className="text-center bg-gray-50">
                            <tr>
                                <th className="border border-black p-1 w-10">ลำดับที่</th>
                                <th className="border border-black p-1">รายละเอียดสินค้า</th>
                                <th className="border border-black p-1 w-28">ปริมาณงานพิมพ์<br />(แผ่น/3ปี)</th>
                                <th className="border border-black p-1 w-28">อัตราค่าบริการ<br />(บาท/แผ่น)</th>
                                <th className="border border-black p-1 w-32">มูลค่า<br />(บาท)</th>
                            </tr>
                        </thead>
                        <tbody className="text-center align-top">
                            {items.map((item, index) => {
                                const products = item.products || {} as Product;
                                const isMachine = !!products.brand && !!products.speed_ppm;

                                return (
                                    <tr>
                                        <td className="border border-black p-1 px-2 align-middle">{index + 1}</td>
                                        <td className="border border-black p-1 px-2 text-left">
                                            {isMachine ? (
                                                <div className="leading-tight">
                                                    <div>เครื่องถ่ายเอกสารยี่ห้อ {products.brand || '-'} เครื่องใหม่ จำนวน {item.quantity || 1} เครื่อง</div>
                                                    <div>รุ่น {products.model || '-'} {products.color_type === 'Color' ? 'สี-ขาวดำ' : 'ขาว-ดำ'} {products.paper_size || '-'} ความเร็ว {products.speed_ppm || '-'} แผ่น</div>
                                                    <div>Copy+Print+Scan</div>
                                                </div>
                                            ) : (
                                                <div>{products.model || products.brand || '-'}</div>
                                            )}
                                        </td>
                                        <td className="border border-black p-1 px-2 align-middle">
                                            {isMachine ? '-' : (item.quantity > 1 ? formatNumber(item.quantity) : '-')}
                                        </td>
                                        <td className="border border-black p-1 px-2 align-middle">
                                            {isMachine ? '-' : (item.unit_price ? item.unit_price.toFixed(2) : '-')}
                                        </td>
                                        <td className="border border-black p-1 px-2 text-right align-middle">
                                            {!item.total_price ? '-' : formatCurrency(item.total_price)}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Empty Rows Filler for fixed height look if needed, or min-height on logic */}
                            {[...Array(Math.max(0, 3 - items.length))].map((_, i) => (
                                <tr key={`empty-${i}`}>
                                    <td className="border border-black p-2">&nbsp;</td>
                                    <td className="border border-black p-2">&nbsp;</td>
                                    <td className="border border-black p-2">&nbsp;</td>
                                    <td className="border border-black p-2">&nbsp;</td>
                                    <td className="border border-black p-2">&nbsp;</td>
                                </tr>
                            ))}

                            {/* Summary Rows */}
                            <tr>
                                <td colSpan={4} className="border border-black p-1 px-2 text-right font-bold w-[70%]">จำนวนเงินรวม</td>
                                <td className="border border-black p-1 px-2 bg-gray-50 text-right w-[30%]">{formatCurrency(subtotal)}</td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="border border-black p-1 px-2 text-right font-bold w-[70%]">ภาษีมูลค่าเพิ่ม 7%</td>
                                <td className="border border-black p-1 px-2 bg-gray-50 text-right w-[30%]">{formatCurrency(vat)}</td>
                            </tr>
                            <tr>
                                <td colSpan={4} className="border border-black p-1 px-2 text-right font-bold w-[70%]">จำนวนเงินรวมทั้งสิ้น (รวมภาษีมูลค่าเพิ่ม 7%)</td>
                                <td className="border border-black p-1 px-2 bg-gray-50 text-right font-bold w-[30%]">{formatCurrency(total)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Notes */}
                    <div className="mb-4 text-[11px]">
                        <p className="font-bold mb-1">หมายเหตุ :</p>
                        <div className="pl-4 space-y-1 whitespace-pre-wrap font-sans">
                            {quotation.notes || '1. รายละเอียดเครื่องตามเอกสารแนบ'}
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="mb-4 text-[10px]">
                        <u className="font-bold mb-1 block">เงื่อนไขการขาย</u>
                        {customTerms ? (
                            <ol className="list-decimal pl-8 space-y-0.5">
                                {customTerms.split('\n').filter(line => line.trim()).map((line, idx) => (
                                    <li key={idx}>{line.replace(/^\d+\.\s*/, '')}</li>
                                ))}
                            </ol>
                        ) : (
                            <ol className="list-decimal pl-8 space-y-0.5">
                                {templateSettings.termsAndConditions.map((term, idx) => (
                                    <li key={idx}>{term}</li>
                                ))}
                            </ol>
                        )}
                    </div>

                    {/* Proposal Text */}
                    <div className="mb-8 text-[11px]">
                        <p>{templateSettings.companyName} หวังเป็นอย่างยิ่งว่าจะได้รับการพิจารณาจากทางบริษัทฯ ของท่าน และขอขอบพระคุณล่วงหน้ามา ณ โอกาสนี้</p>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-8 text-[11px] mt-4 avoid-break">
                        {/* Left Side: Customer Signature */}
                        <div className="text-center">
                            <p className="font-bold mb-6">ข้าพเจ้ารับทราบเงื่อนไขตามใบเสนอราคาดังกล่าว</p>
                            <div className="border-b border-dotted border-black w-3/4 mx-auto mb-2"></div>
                            <p className="mb-2">ลงชื่อ........................................................................</p>
                            <p>ผู้อนุมัติสั่งซื้อสินค้า</p>
                        </div>

                        {/* Right Side: Proposer Signature */}
                        <div className="text-center">
                            <p className="font-bold mb-12">ขอแสดงความนับถือ</p>
                            <div className="flex flex-col items-center">
                                <p className="font-bold text-[12px]">{quotation.users?.name || templateSettings.proposerName}</p>
                                <p>ผู้นำเสนอโครงการ {projectName}</p>

                                <div className="mt-4 flex flex-col items-center">
                                    <p>ติดต่อสอบถามข้อมูลเพิ่มเติม ได้ที่</p>
                                    <p>หมายเลขโทรศัพท์ {quotation.users?.phone || templateSettings.proposerPhone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </DialogContent>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
                
                :root {
                    --font-sarabun: 'Sarabun', sans-serif;
                }

                .print-content, .print-content * {
                    font-family: 'Sarabun', sans-serif;
                }

                @media print {
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    body {
                        visibility: hidden;
                        background: white;
                    }
                    .print-content {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        height: auto !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none;
                        box-shadow: none;
                    }
                    /* Ensure table borders show up in print */
                    table { border-collapse: collapse !important; }
                    td, th { border: 1px solid black !important; }
                    
                    /* Hide dialog UI elements */
                    .no-print { display: none !important; }
                }
            `}</style>
        </Dialog>
    );
}
