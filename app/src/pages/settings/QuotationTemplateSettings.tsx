import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    templateSettingsService,
    type QuotationTemplateSettings as TemplateSettingsType
} from '@/services/templateSettings';
import { ArrowLeft, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';

export function QuotationTemplateSettings() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<TemplateSettingsType>(templateSettingsService.getDefaults());
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const loaded = templateSettingsService.get();
        setSettings(loaded);
    }, []);

    const handleChange = (field: keyof TemplateSettingsType, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleTermChange = (index: number, value: string) => {
        const newTerms = [...settings.termsAndConditions];
        newTerms[index] = value;
        setSettings(prev => ({ ...prev, termsAndConditions: newTerms }));
    };

    const addTerm = () => {
        setSettings(prev => ({
            ...prev,
            termsAndConditions: [...prev.termsAndConditions, '']
        }));
    };

    const removeTerm = (index: number) => {
        setSettings(prev => ({
            ...prev,
            termsAndConditions: prev.termsAndConditions.filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            templateSettingsService.save(settings);
            setSaveMessage('บันทึกเรียบร้อยแล้ว');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (e) {
            setSaveMessage('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('คุณต้องการรีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นหรือไม่?')) {
            templateSettingsService.reset();
            setSettings(templateSettingsService.getDefaults());
            setSaveMessage('รีเซ็ตเรียบร้อยแล้ว');
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">เทมเพลตใบเสนอราคา</h1>
                    <p className="text-gray-500">กำหนดค่าเริ่มต้นสำหรับใบเสนอราคา</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Company Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>ข้อมูลบริษัท</CardTitle>
                        <CardDescription>ข้อมูลบริษัทที่จะแสดงในใบเสนอราคา</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>ชื่อบริษัท</Label>
                            <Input
                                value={settings.companyName}
                                onChange={(e) => handleChange('companyName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ที่อยู่</Label>
                            <Textarea
                                value={settings.companyAddress}
                                onChange={(e) => handleChange('companyAddress', e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>โทรศัพท์</Label>
                                <Input
                                    value={settings.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>แฟกซ์</Label>
                                <Input
                                    value={settings.fax}
                                    onChange={(e) => handleChange('fax', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>อีเมล</Label>
                                <Input
                                    value={settings.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>เลขประจำตัวผู้เสียภาษี</Label>
                                <Input
                                    value={settings.taxId}
                                    onChange={(e) => handleChange('taxId', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Proposer Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>ผู้เสนอราคา</CardTitle>
                        <CardDescription>ข้อมูลผู้นำเสนอโครงการที่จะแสดงในใบเสนอราคา</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>ชื่อ-สกุล</Label>
                            <Input
                                value={settings.proposerName}
                                onChange={(e) => handleChange('proposerName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ตำแหน่ง/หน้าที่</Label>
                            <Input
                                value={settings.proposerTitle}
                                onChange={(e) => handleChange('proposerTitle', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>เบอร์โทรศัพท์</Label>
                            <Input
                                value={settings.proposerPhone}
                                onChange={(e) => handleChange('proposerPhone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>ระยะเวลายืนราคา (วัน)</Label>
                            <Input
                                type="number"
                                value={settings.defaultValidityDays}
                                onChange={(e) => handleChange('defaultValidityDays', parseInt(e.target.value) || 30)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Terms & Conditions */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>เงื่อนไขการขาย</CardTitle>
                            <CardDescription>รายการเงื่อนไขที่จะแสดงในใบเสนอราคา</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={addTerm}>
                            <Plus className="w-4 h-4 mr-2" /> เพิ่มข้อ
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {settings.termsAndConditions.map((term, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <span className="text-gray-500 font-medium w-8 pt-2 text-right">{index + 1}.</span>
                                <Input
                                    value={term}
                                    onChange={(e) => handleTermChange(index, e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTerm(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {settings.termsAndConditions.length === 0 && (
                            <p className="text-gray-400 text-center py-4">ไม่มีเงื่อนไข กดปุ่ม "เพิ่มข้อ" เพื่อเพิ่มเงื่อนไขใหม่</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                        <Button variant="outline" onClick={handleReset} className="gap-2">
                            <RotateCcw className="w-4 h-4" /> รีเซ็ตเป็นค่าเริ่มต้น
                        </Button>
                        <div className="flex items-center gap-4">
                            {saveMessage && (
                                <span className={`text-sm ${saveMessage.includes('ผิดพลาด') ? 'text-red-600' : 'text-green-600'}`}>
                                    {saveMessage}
                                </span>
                            )}
                            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                                <Save className="w-4 h-4" /> {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
