import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Camera, X, CheckCircle, AlertCircle, Printer, Wrench } from 'lucide-react';
import { mockMachines } from '@/data/mockData';

export function QRScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [foundMachine, setFoundMachine] = useState<typeof mockMachines[0] | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    setScannedData(null);
    setFoundMachine(null);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // Ignore scan errors
        }
      );

      setIsScanning(true);
    } catch (err) {
      setError('ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาตใช้งานกล้อง');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScan = (data: string) => {
    setScannedData(data);
    stopScanning();

    // Try to find machine by serial number
    const machine = mockMachines.find(m => 
      m.serialNumber.toLowerCase() === data.toLowerCase() ||
      m.id === data
    );

    if (machine) {
      setFoundMachine(machine);
    }
  };

  const handleManualInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serialNumber = formData.get('serialNumber') as string;
    if (serialNumber) {
      handleScan(serialNumber);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">สแกน QR Code</h1>
        <p className="text-gray-500">สแกนเพื่อค้นหาเครื่องพิมพ์</p>
      </div>

      {/* Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            สแกน QR Code
          </CardTitle>
          <CardDescription>
            สแกน QR Code บนเครื่องพิมพ์เพื่อดูข้อมูลและบันทึกงาน
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isScanning ? (
            <div className="space-y-4">
              <div id="qr-reader" className="w-full max-w-md mx-auto" />
              <Button 
                variant="outline" 
                onClick={stopScanning}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                หยุดสแกน
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {!scannedData && (
                <>
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">กดปุ่มด้านล่างเพื่อเริ่มสแกน</p>
                    <Button onClick={startScanning} size="lg">
                      <Camera className="w-5 h-5 mr-2" />
                      เริ่มสแกน
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 text-center mb-4">หรือกรอก Serial Number ด้วยตนเอง</p>
                    <form onSubmit={handleManualInput} className="flex gap-2">
                      <input
                        name="serialNumber"
                        type="text"
                        placeholder="Serial Number..."
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <Button type="submit">
                        ค้นหา
                      </Button>
                    </form>
                  </div>
                </>
              )}

              {scannedData && !foundMachine && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    ไม่พบเครื่องพิมพ์ที่มี Serial Number: {scannedData}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Machine Info */}
      {foundMachine && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              พบเครื่องพิมพ์
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Printer className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="text-xl font-bold">{foundMachine.serialNumber}</p>
                  <Badge className={foundMachine.status === 'Installed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                    {foundMachine.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">เลขมิเตอร์ขาวดำ</p>
                  <p className="text-lg font-semibold">{foundMachine.currentCounterMono.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">เลขมิเตอร์สี</p>
                  <p className="text-lg font-semibold">{foundMachine.currentCounterColor.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => navigate(`/technician/jobs/new?machine=${foundMachine.id}`)}
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  สร้างงานซ่อม
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate(`/technician/meter-reading?machine=${foundMachine.id}`)}
                >
                  บันทึกมิเตอร์
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
