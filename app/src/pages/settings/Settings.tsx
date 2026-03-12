import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ChevronRight } from 'lucide-react';

interface SettingsItem {
    title: string;
    description: string;
    icon: React.ElementType;
    path: string;
}

const settingsItems: SettingsItem[] = [
    {
        title: 'เทมเพลตใบเสนอราคา',
        description: 'กำหนดค่าเริ่มต้นสำหรับใบเสนอราคา เช่น ข้อมูลบริษัท เงื่อนไขการขาย',
        icon: FileText,
        path: '/settings/quotation-template'
    },
    // Future settings can be added here
    // {
    //     title: 'การแจ้งเตือน',
    //     description: 'ตั้งค่าการแจ้งเตือนทางอีเมลและแอปพลิเคชัน',
    //     icon: Bell,
    //     path: '/settings/notifications'
    // },
];

export function Settings() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">การตั้งค่า</h1>
                <p className="text-gray-500">จัดการการตั้งค่าระบบ</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {settingsItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Card
                            key={item.path}
                            className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                            onClick={() => navigate(item.path)}
                        >
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Icon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-base">{item.title}</CardTitle>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{item.description}</CardDescription>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
