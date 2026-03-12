import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { quotationsApi, type Quotation } from '@/services/api/quotations';
import { contractsApi, type Contract } from '@/services/api/contracts';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, FileText, ClipboardList, Eye, AlertCircle, Loader2 } from 'lucide-react';

export function Approvals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingQuotations, setPendingQuotations] = useState<any[]>([]);
  const [pendingContracts, setPendingContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [quotations, contracts] = await Promise.all([
        quotationsApi.getPendingApproval(),
        contractsApi.getAll(),
      ]);
      setPendingQuotations(quotations || []);
      setPendingContracts(
        (contracts || []).filter((c: any) => c.status === 'pending_approval')
      );
    } catch (error) {
      console.error('Error fetching approval data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (type: 'quotation' | 'contract', id: string) => {
    if (!user) return;
    setActionLoading(true);
    try {
      if (type === 'quotation') {
        await quotationsApi.approve(id, user.id);
      } else {
        await contractsApi.activate(id, user.id);
      }
      alert(`อนุมัติ${type === 'quotation' ? 'ใบเสนอราคา' : 'สัญญา'}เรียบร้อย`);
      fetchData();
    } catch (error) {
      console.error('Error approving:', error);
      alert('เกิดข้อผิดพลาดในการอนุมัติ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }
    if (!user || !selectedItem) return;
    setActionLoading(true);
    try {
      if (selectedItem.type === 'quotation') {
        await quotationsApi.reject(selectedItem.id, user.id, rejectReason);
      } else {
        await contractsApi.update(selectedItem.id, {
          status: 'terminated',
        });
      }
      alert(`ปฏิเสธ${selectedItem.type === 'quotation' ? 'ใบเสนอราคา' : 'สัญญา'}เรียบร้อย`);
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('เกิดข้อผิดพลาดในการปฏิเสธ');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">อนุมัติ</h1>
        <p className="text-gray-500">อนุมัติใบเสนอราคาและสัญญา</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">ใบเสนอราคารออนุมัติ</p>
                <p className="text-3xl font-bold text-yellow-800">{pendingQuotations.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">สัญญารออนุมัติ</p>
                <p className="text-3xl font-bold text-blue-800">{pendingContracts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quotations">
        <TabsList>
          <TabsTrigger value="quotations">
            ใบเสนอราคา ({pendingQuotations.length})
          </TabsTrigger>
          <TabsTrigger value="contracts">
            สัญญา ({pendingContracts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quotations">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ใบเสนอราคารออนุมัติ</CardTitle>
              <CardDescription>ตรวจสอบและอนุมัติใบเสนอราคา</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingQuotations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>ไม่มีใบเสนอราคารออนุมัติ</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ใบเสนอราคา</TableHead>
                        <TableHead>ลูกค้า</TableHead>
                        <TableHead>ราคา</TableHead>
                        <TableHead>ส่วนลด</TableHead>
                        <TableHead>ราคาสุทธิ</TableHead>
                        <TableHead>ใช้ได้ถึง</TableHead>
                        <TableHead className="w-48">การดำเนินการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingQuotations.map((quote: any) => (
                        <TableRow key={quote.id}>
                          <TableCell>
                            <div className="font-medium">{quote.quote_number}</div>
                            <div className="text-xs text-gray-500">{formatDate(quote.created_at)}</div>
                          </TableCell>
                          <TableCell>{quote.customers?.company_name || '-'}</TableCell>
                          <TableCell>{formatCurrency(quote.subtotal || 0)}</TableCell>
                          <TableCell>{formatCurrency(quote.discount || 0)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(quote.total || 0)}</TableCell>
                          <TableCell>{formatDate(quote.valid_until)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/quotations/${quote.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                ดู
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={actionLoading}
                                onClick={() => handleApprove('quotation', quote.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                อนุมัติ
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={actionLoading}
                                onClick={() => {
                                  setSelectedItem({ type: 'quotation', id: quote.id });
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                ปฏิเสธ
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">สัญญารออนุมัติ</CardTitle>
              <CardDescription>ตรวจสอบและอนุมัติสัญญาเช่า</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingContracts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>ไม่มีสัญญารออนุมัติ</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>สัญญา</TableHead>
                        <TableHead>ลูกค้า</TableHead>
                        <TableHead>ค่าบริการ/เดือน</TableHead>
                        <TableHead>ระยะเวลา</TableHead>
                        <TableHead className="w-48">การดำเนินการ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingContracts.map((contract: any) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            <div className="font-medium">{contract.contract_number}</div>
                            <div className="text-xs text-gray-500">{formatDate(contract.created_at)}</div>
                          </TableCell>
                          <TableCell>{contract.customers?.company_name || '-'}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(contract.monthly_fee || 0)}/เดือน</TableCell>
                          <TableCell>
                            {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/contracts/${contract.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                ดู
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={actionLoading}
                                onClick={() => handleApprove('contract', contract.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                อนุมัติ
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={actionLoading}
                                onClick={() => {
                                  setSelectedItem({ type: 'contract', id: contract.id });
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                ปฏิเสธ
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              ปฏิเสธ{selectedItem?.type === 'quotation' ? 'ใบเสนอราคา' : 'สัญญา'}
            </DialogTitle>
            <DialogDescription>
              กรุณาระบุเหตุผลในการปฏิเสธ
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="เหตุผลในการปฏิเสธ..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading}
              onClick={handleReject}
            >
              {actionLoading ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
