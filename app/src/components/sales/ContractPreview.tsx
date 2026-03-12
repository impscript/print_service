import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { contractsApi } from '@/services/api/contracts';

interface ContractPreviewProps {
    contractId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ContractPreview({ contractId, isOpen, onClose }: ContractPreviewProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [contract, setContract] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && contractId) {
            fetchContractDetails();
        } else {
            setContract(null);
            setError(null);
        }
    }, [isOpen, contractId]);

    const fetchContractDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await contractsApi.getById(contractId!);
            setContract(data);
        } catch (err: any) {
            console.error('Failed to fetch contract details:', err);
            setError(err.message || 'Failed to load contract details');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Contract_${contract?.contract_number || 'Draft'}`,
    });

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:max-w-[210mm] p-0 gap-0 bg-white shadow-2xl">
                {/* No Print Header */}
                <div className="flex items-center justify-between p-4 border-b no-print bg-gray-50 sticky top-0 z-10">
                    <DialogTitle>Contract Preview</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={handlePrint} 
                            size="sm" 
                            className="gap-2"
                            disabled={!contract || loading}
                        >
                            <Printer className="w-4 h-4" /> Print
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        {error}
                    </div>
                ) : contract ? (
                    <ContractContent contract={contract} printRef={printRef} />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function ContractContent({ contract, printRef }: { contract: any; printRef: React.RefObject<HTMLDivElement | null> }) {
    const customer = contract.customers || {};
    const machines = contract.contract_machines || [];

    // Calculate duration in years roughly
    const startDate = new Date(contract.start_date);
    const endDate = new Date(contract.end_date);
    let diffMonths = 0;
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    }
    const years = diffMonths >= 12 ? Math.floor(diffMonths / 12) : 0;
    const months = diffMonths % 12;

    let durationText = '.................. ปี (หรือ ............... เดือน)';
    if (diffMonths > 0) {
        durationText = years > 0 ? `${years} ปี ${months > 0 ? `และ ${months} เดือน` : ''}` : `${months} เดือน`;
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('th-TH', { style: 'decimal', minimumFractionDigits: 2 }).format(value);
    };

    return (
        <>
            {/* Printable Content - A4 Fixed Size */}
            <div className="print-content bg-gray-100 text-black text-[15px] leading-relaxed mx-auto py-8" ref={printRef}>
              
                {/* Page 1 */}
                <div className="page bg-white shadow-sm" style={{ position: 'relative', width: '210mm', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box', margin: '0 auto' }}>
                    {/* Header */}
                    <div className="text-right text-[14px] mb-8">
                        สัญญาเลขที่ {contract.contract_number || '...........................................'}
                    </div>

                    <div className="text-center font-bold text-xl mb-8">
                        สัญญาการให้บริการ
                    </div>

                    <div className="mb-2 text-right">
                         ทำที่ บริษัท ดั๊บเบิ้ล เอ ดิจิตอล ซินเนอร์จี จำกัด
                    </div>
                    <div className="mb-8 text-right">
                         วันที่ {contract.created_at || contract.start_date ? formatDate(contract.created_at || contract.start_date) : '...........................................'}
                    </div>

                    {/* Parties */}
                    <div className="mb-4">
                        <p className="indent-10 mb-2 text-justify">
                            สัญญาฉบับนี้ทำขึ้นระหว่าง <strong>บริษัท ดั๊บเบิ้ล เอ ดิจิตอล ซินเนอร์จี จำกัด</strong> สำนักงานตั้งอยู่เลขที่ 187/3 หมู่ 1 ถ.บางนา-ตราด (กม.42) ต.บางวัว อ.บางปะกง จ.ฉะเชิงเทรา 24180 โทรศัพท์ 0-2659-1555 ตรอก/ซอย - ถนน บางนา-ตราด ซึ่งต่อไปในสัญญานี้จะเรียกว่า <strong>“ผู้ให้บริการ”</strong> ฝ่ายหนึ่ง กับ
                        </p>
                        <p className="indent-10 mb-4 text-justify">
                            <strong>{customer.company_name || '....................................................................................................'}</strong> สำนักงานตั้งอยู่เลขที่ {customer.address || '......................................................................................................................................'} ซึ่งต่อไปในสัญญานี้เรียกว่า <strong>“ผู้รับบริการ”</strong> อีกฝ่ายหนึ่ง
                        </p>
                        <p className="indent-10 mb-4">
                            ทั้งสองฝ่ายตกลงทำสัญญากันดังมีข้อความต่อไปนี้
                        </p>
                    </div>

                    {/* Clauses */}
                    <div className="space-y-4 text-justify">
                        <div>
                            <p>
                                <strong>1.</strong> ผู้ให้บริการตกลงให้ใช้สมาร์ต พริ้นเตอร์ (Smart Printer) พร้อมทั้งอุปกรณ์เพื่อใช้ประโยชน์ในการถ่ายเอกสารและสแกนเท่านั้น (ต่อไปจะเรียกว่าเครื่องถ่ายเอกสาร) เครื่องถ่ายเอกสารมีรายละเอียดดังนี้
                            </p>
                            <div className="mt-4 mb-4">
                                <table className="w-full border-collapse border border-black text-[14px] text-center">
                                    <thead>
                                        <tr>
                                            <th className="border border-black p-2 font-normal">ยี่ห้อ/รุ่น</th>
                                            <th className="border border-black p-2 font-normal">หมายเลขเครื่อง</th>
                                            <th className="border border-black p-2 font-normal">สถานที่ติดตั้งเครื่องถ่ายเอกสาร</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {machines.length > 0 ? machines.map((cm: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="border border-black p-2 text-left">{cm.machines?.products?.brand} {cm.machines?.products?.model}</td>
                                                <td className="border border-black p-2">{cm.machines?.serial_number || '-'}</td>
                                                <td className="border border-black p-2 text-left">
                                                    {cm.installation_address || customer.address || '-'}
                                                </td>
                                            </tr>
                                        )) : (
                                            <>
                                                <tr>
                                                    <td className="border border-black p-2 text-left text-white">_</td>
                                                    <td className="border border-black p-2 text-white">_</td>
                                                    <td className="border border-black p-2 text-left text-white">_</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-black p-2 text-left text-white">_</td>
                                                    <td className="border border-black p-2 text-white">_</td>
                                                    <td className="border border-black p-2 text-left text-white">_</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                                <p className="mt-2 ml-2">(เพิ่มเติม) ............................................................................................................................................................</p>
                                <p className="mt-2 ml-2">(เพิ่มเติม) ............................................................................................................................................................</p>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2">
                                <strong>2.</strong> ผู้ให้บริการตกลงให้บริการและให้ผู้รับบริการใช้เครื่องถ่ายเอกสารมีกำหนดระยะเวลา <strong>{durationText}</strong> นับตั้งแต่วันที่ระบุในเอกสารส่งมอบเครื่องเป็นต้นไป โดยผู้รับบริการและผู้ให้บริการตกลงเช่าสมาร์ต พริ้นเตอร์ (Smart Printer) ดังกล่าวในข้อ 1 ในอัตราค่าบริการ <strong>{contract.expected_revenue != null ? formatCurrency(contract.expected_revenue) : '.........................'}</strong> บาท/เดือน (.................................................................................) โดยผู้รับบริการมีสิทธิถ่ายเอกสาร ขาว-ดำได้ จำนวน <strong>{contract.included_black_clicks != null ? formatCurrency(contract.included_black_clicks) : '...........................'}</strong> แผ่น และ ถ่ายสีได้ จำนวน <strong>{contract.included_color_clicks != null ? formatCurrency(contract.included_color_clicks) : '...........................'}</strong> แผ่น กรณีที่ผู้รับบริการถ่ายเอกสารเกินกว่าที่กำหนด ผู้รับบริการยินยอมชำระค่าถ่ายเอกสารส่วนที่เกินในอัตราแผ่นละ ขาว-ดำ <strong>{contract.click_rate_black != null ? formatCurrency(contract.click_rate_black) : '..........'}</strong> บาท และสี <strong>{contract.click_rate_color != null ? formatCurrency(contract.click_rate_color) : '..........'}</strong> บาท (.........................................................) ทั้งนี้ ราคาดังกล่าวยังไม่รวมภาษีมูลค่าเพิ่ม
                            </p>
                            <p className="mb-2 indent-10">
                                เงินประกันความเสียหายสัญญาเป็นจำนวนเงิน <strong>{contract.contract_value ? formatCurrency(contract.contract_value) : '............................'}</strong> บาท (............................................................................) จะคืนเงินประกันให้เมื่อสิ้นสุดสัญญา หรือมีการบอกเลิกสัญญา โดยผู้รับบริการได้ชำระค่าบริการ ตลอดจนหนี้สินอื่นใดครบถ้วน และผู้รับบริการต้องส่งมอบเครื่องถ่ายเอกสารคืน ในสภาพที่ใช้งานได้ตามปกติ
                            </p>
                        </div>

                        <div>
                            <p className="indent-10">
                                <strong>3.</strong> การชำระค่าบริการและการกำหนดเงื่อนไขการให้บริการต่างๆ ในการให้บริการ ให้เป็นไปตามเงื่อนไขที่ระบุในเอกสารแนบท้ายสัญญาฉบับนี้ ข้อกำหนดและเงื่อนไขการให้บริการดังกล่าวให้ถือเป็นส่วนหนึ่งของสัญญานี้ด้วย
                            </p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <p className="indent-10 mb-12 text-justify">
                            สัญญานี้ทำขึ้นเป็นสองฉบับมีข้อความถูกต้องตรงกัน ทั้งสองฝ่ายได้อ่านและเข้าใจข้อความในสัญญานี้ดีโดยตลอดแล้ว จึงได้ลงลายมือชื่อและประทับตรา(ถ้ามี) ไว้เป็นสำคัญต่อหน้าพยาน และเก็บไว้ฝ่ายละฉบับ
                        </p>

                        <div className="grid grid-cols-2 gap-x-12 mt-8 text-center text-sm avoid-break">
                            <div className="mb-8">
                                <p className="mb-6 invisible">_</p>
                                <p className="mb-2">ลงชื่อ..................................................ผู้รับมอบอำนาจกระทำการแทน</p>
                                <p className="mb-2">(นายศิริศักดิ์ นาใจคง)</p>
                            </div>
                            <div className="mb-8 pl-12">
                                <p className="mb-6 text-left">ลงชื่อ...........................................................</p>
                                <p className="mb-2">ลงชื่อ..................................................ผู้รับบริการ</p>
                                <p className="mb-2">(........................................................)</p>
                            </div>
                            <div>
                                <p className="mb-2">ลงชื่อ..................................................พยาน</p>
                                <p className="mb-2">(นายคมสัน มากดี)</p>
                            </div>
                            <div className="pl-12">
                                <p className="mb-2">ลงชื่อ..................................................พยาน</p>
                                <p className="mb-2">(นางสาวจิตรลดา โสมนัส)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Break formatting */}
                <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>

                {/* Page 2: Annex 1 */}
                <div className="page bg-white shadow-sm mt-8 print:mt-0" style={{ position: 'relative', width: '210mm', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box', margin: '0 auto' }}>
                    <div className="text-center font-bold text-lg mb-8">
                        เอกสารแนบท้าย 1
                    </div>
                    
                    <div className="font-bold mb-4 underline">การชำระค่าบริการ</div>
                    
                    <div className="space-y-4 text-justify pr-4">
                        <div className="flex gap-2">
                            <span>1.</span>
                            <div className="flex-1">
                                ผู้รับบริการตกลงชำระค่าบริการให้แก่ผู้ให้บริการ โดยแคชเชียร์เช็คของธนาคารหรือวิธีอื่นตามแต่จะตกลงกัน ทั้งนี้ผู้ให้บริการต้องส่งใบแจ้งหนี้ค่าใช้บริการพร้อมรายละเอียด ภายในสัปดาห์ที่ 2 ของเดือนถัดจากเดือนที่ใช้บริการ
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span>2.</span>
                            <div className="flex-1">
                                ผู้รับบริการตกลงชำระค่าบริการภายใน 30 วันนับจากได้รับใบแจ้งหนี้ กรณีที่ผู้รับบริการผิดนัดชำระค่าบริการ ผู้รับบริการตกลงเสียดอกเบี้ยในอัตราร้อยละ 15 ต่อปี ของเงินที่ค้างชำระ นับแต่วันผิดนัดจนกว่าจะได้ชำระครบถ้วน
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span>3.</span>
                            <div className="flex-1">
                                การชำระค่าบริการตามสัญญาฉบับนี้ เมื่อถึงกำหนดชำระ ผู้รับบริการจะต้องชำระจนเต็มจำนวน จะขอชำระเพียงบางส่วนหาได้ไม่ เว้นแต่จะได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้บริการ
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Break */}
                <div className="page-break" style={{ pageBreakBefore: 'always' }}></div>

                {/* Page 3: Annex 2 */}
                <div className="page bg-white shadow-sm mt-8 print:mt-0" style={{ position: 'relative', width: '210mm', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box', margin: '0 auto' }}>
                    <div className="text-center font-bold text-lg mb-8">
                        เอกสารแนบท้าย 2
                    </div>
                    
                    <div className="font-bold mb-4 underline">ข้อกำหนดและเงื่อนไขการให้บริการถ่ายเอกสาร</div>
                    
                    <div className="space-y-4 text-[15px] text-justify pr-4">
                        <div className="flex gap-2">
                            <span>1</span>
                            <div className="flex-1">ผู้ให้บริการตกลงรับผิดชอบค่าใช้จ่ายต่างๆ อันเกิดกับเครื่องถ่ายเอกสาร เช่น ค่าบำรุงรักษาเครื่อง ค่าตรวจสอบเครื่อง ค่าชิ้นส่วนที่ใช้สับเปลี่ยน และรวมถึงสิ่งที่ใช้สิ้นเปลืองอื่นๆ</div>
                        </div>
                        <div className="flex gap-2">
                            <span>2</span>
                            <div className="flex-1">ผู้ให้บริการเป็นผู้ดูแลรักษาเครื่องถ่ายเอกสารให้อยู่ในสภาพใช้งานได้ดี และจะทำการตรวจสอบปรับเครื่อง เปลี่ยนชิ้นส่วน และทำการซ่อมแซมเครื่องตามมาตรฐานที่ผู้ให้บริการกำหนดไว้ โดยไม่คิดค่าบริการใดๆ</div>
                        </div>
                        <div className="flex gap-2">
                            <span>3</span>
                            <div className="flex-1">ผู้ให้บริการจะเข้าตรวจเช็คตัวเลขจำนวนสำเนาเอกสารที่ถ่ายและปริมาณกระดาษที่เหลือในวันทำการสุดท้าย ของแต่ละเดือน และจะจัดส่งใบแจ้งหนี้เรียกเก็บเงินแก่ผู้รับบริการเป็นรายเดือน</div>
                        </div>
                        <div className="flex gap-2">
                            <span>4</span>
                            <div className="flex-1">ในกรณีที่เครื่องถ่ายเอกสารไม่สามารถใช้งานได้ ผู้ให้บริการจะจัดส่งเจ้าหน้าที่ไปทำการซ่อมแซมและแก้ไขให้ใช้งานได้ภายใน 6 ชั่วโมง</div>
                        </div>
                        <div className="flex gap-2">
                            <span>5</span>
                            <div className="flex-1">เครื่องถ่ายเอกสารเป็นทรัพย์สินของผู้ให้บริการ ซึ่งอาจจะจัดส่งเครื่องใหม่ หรือเครื่องที่ปรับสภาพแล้วมาแทนได้ ตามที่ผู้ให้บริการจะเห็นสมควร โดยจะแจ้งให้ผู้รับบริการรับทราบล่วงหน้าไม่น้อยกว่า 7 วัน</div>
                        </div>
                        <div className="flex gap-2">
                            <span>6</span>
                            <div className="flex-1">ผู้รับบริการยินยอมให้ผู้ให้บริการ และหรือตัวแทนเข้าทำการบริการตรวจสอบ และบำรุงรักษาเครื่องในระหว่างเวลาทำงานปกติ อย่างน้อยเดือนละ ครั้ง</div>
                        </div>
                        <div className="flex gap-2">
                            <span>7</span>
                            <div className="flex-1">ผู้รับบริการจะต้องจัดเตรียมสถานที่ ตำแหน่งที่เหมาะสมแก่การติดตั้งเครื่องถ่ายเอกสาร โดยจะต้องไม่เป็นสถานที่ ที่มีฝุ่นละอองมาก หรือสถานที่เปียกชื้น หรือกลางแจ้งที่ไม่เหมาะสม หรือสถานที่ที่มีกระแสไฟฟ้า ไม่สม่ำเสมอ และ/หรือไม่ทำการแก้ไข ดัดแปลงเครื่องถ่ายเอกสาร</div>
                        </div>
                        <div className="flex gap-2">
                            <span>8</span>
                            <div className="flex-1">ผู้รับบริการต้องจ่ายค่าซ่อมแซม หรือค่าเปลี่ยนชิ้นส่วน ซึ่งเป็นผลโดยตรงจากการกระทำนั้นซึ่งเกิดจากการกระทำโดยจงใจหรือประมาทเลินเล่อของผู้รับบริการ</div>
                        </div>
                        <div className="flex gap-2">
                            <span>9</span>
                            <div className="flex-1">ผู้รับบริการจะไม่โอนสิทธิตามสัญญานี้ให้ผู้อื่น เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้บริการ</div>
                        </div>
                        <div className="flex gap-2">
                            <span>10</span>
                            <div className="flex-1">ในกรณีที่ผู้รับบริการบอกเลิกสัญญาก่อนครบกำหนดระยะเวลาตามที่กำหนดไว้ในสัญญา ผู้รับบริการต้องส่งคำบอกกล่าวเป็นหนังสือให้ผู้ให้บริการทราบล่วงหน้า ไม่น้อยกว่า 30 วันและต้องชำระค่าบริการที่ค้างทั้งหมด</div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
                
                :root {
                    --font-sarabun: 'Sarabun', sans-serif;
                }

                .print-content, .print-content * {
                    font-family: 'Sarabun', sans-serif;
                }

                /* Hide scrollbar for the modal content but keep it scrollable */
                .print-content::-webkit-scrollbar {
                    display: none;
                }
                .print-content {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
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
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none;
                        background: transparent;
                    }
                    .page {
                        width: auto !important;
                        min-height: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                    }
                    .page-break {
                        display: block;
                        page-break-before: always;
                    }
                    .avoid-break {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>
        </>
    );
}

