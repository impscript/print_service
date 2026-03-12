import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockContracts, getCustomerById } from '@/data/mockData';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel, calculateDaysUntil } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, ClipboardList, Building, Calendar, AlertTriangle, Edit, Eye, FileText, RefreshCw } from 'lucide-react';

export function Contracts() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredContracts = mockContracts.filter(contract => {
    const customer = getCustomerById(contract.customerId);
    const matchesSearch = 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const expiringContracts = filteredContracts.filter(c => {
    const daysUntil = calculateDaysUntil(c.endDate);
    return c.status === 'active' && daysUntil <= 60;
  });

  const statusOptions = [
    { value: 'draft', label: 'ร่าง' },
    { value: 'pending_approval', label: 'รออนุมัติ' },
    { value: 'active', label: 'ใช้งานอยู่' },
    { value: 'expired', label: 'หมดอายุ' },
    { value: 'terminated', label: 'ยกเลิก' },
    { value: 'renewal_pending', label: 'รอต่ออายุ' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สัญญา</h1>
          <p className="text-gray-500">จัดการสัญญาเช่าและการต่ออายุ</p>
        </div>
        <Button onClick={() => navigate('/contracts/new')}>
          <Plus className="w-4 h-4 mr-2" />
          สร้างสัญญาใหม่
        </Button>
      </div>

      {/* Expiring Alert */}
      {expiringContracts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              สัญญาใกล้หมดอายุ ({expiringContracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringContracts.slice(0, 3).map(contract => {
                const customer = getCustomerById(contract.customerId);
                const daysUntil = calculateDaysUntil(contract.endDate);
                return (
                  <div key={contract.id} className="flex items-center justify-between p-2 bg-white rounded border border-amber-100">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium">{contract.contractNumber}</span>
                      <span className="text-sm text-gray-500">- {customer?.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={daysUntil <= 30 ? 'destructive' : 'default'}>
                        เหลือ {daysUntil} วัน
                      </Badge>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        ต่ออายุ
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ค้นหาสัญญาหรือลูกค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">รายการสัญญา ({filteredContracts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สัญญา</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>ค่าบริการ/เดือน</TableHead>
                  <TableHead>ระยะเวลา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => {
                  const customer = getCustomerById(contract.customerId);
                  const daysUntil = calculateDaysUntil(contract.endDate);
                  const isExpiringSoon = contract.status === 'active' && daysUntil <= 60;
                  
                  return (
                    <TableRow key={contract.id} className={isExpiringSoon ? 'bg-amber-50/50' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{contract.contractNumber}</p>
                            <p className="text-xs text-gray-500">{getStatusLabel(contract.pricingType)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{customer?.companyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">{formatCurrency(contract.monthlyFee)}</p>
                        <p className="text-xs text-gray-500">ต่อเดือน</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                          </div>
                          {isExpiringSoon && (
                            <Badge variant="destructive" className="mt-1">
                              เหลือ {daysUntil} วัน
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contract.status)}>
                          {getStatusLabel(contract.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/contracts/${contract.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              ดูรายละเอียด
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/contracts/${contract.id}/edit`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              ดาวน์โหลดสัญญา
                            </DropdownMenuItem>
                            {contract.status === 'active' && daysUntil <= 90 && (
                              <DropdownMenuItem>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                ต่ออายุสัญญา
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
