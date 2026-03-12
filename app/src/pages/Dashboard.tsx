import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { formatCurrency, formatNumber, formatDate, getStatusColor, getStatusLabel, calculateDaysUntil } from '@/lib/utils';
import { dashboardApi, type DashboardCounts } from '@/services/api/dashboard';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  FileText,
  ClipboardList,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Package,
  CheckCircle,
  ArrowRight,
  Calendar,
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardCounts | null>(null);
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);
  const [pendingQuotations, setPendingQuotations] = useState<any[]>([]);
  const [pendingContracts, setPendingContracts] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Ensure user ID is passed
        const userId = user?.id || '';
        
        // Parallel fetching
        const [
            statsData, 
            recentActivity, 
            expiring, 
            approvals, 
            technicianJobs
        ] = await Promise.all([
          dashboardApi.getDashboardCounts(user?.role, userId),
          dashboardApi.getRecentActivity(5),
          dashboardApi.getExpiringContracts(5),
          hasRole(['approver', 'admin']) ? dashboardApi.getPendingApprovals() : Promise.resolve({ quotations: [], contracts: [] }),
          hasRole(['technician']) && userId ? dashboardApi.getTechnicianTodayJobs(userId) : Promise.resolve([])
        ]);

        setStats(statsData);
        setExpiringContracts(expiring);
        
        if (hasRole(['approver', 'admin'])) {
            setPendingQuotations(approvals.quotations);
            setPendingContracts(approvals.contracts);
        }
        
        if (hasRole(['technician'])) {
            setMyJobs(technicianJobs);
        }

        if (hasRole(['sales'])) {
            // For sales, we can just use recent quotations from recentActivity if filtered by user, 
            // but recentActivity doesn't filter by user yet, so we'll just show generic recent activity for now.
            setMyLeads(recentActivity.quotations.slice(0, 5)); 
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
        fetchDashboardData();
    }
  }, [user]);

  if (isLoading || !stats) {
      return (
          <div className="flex h-[50vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
      );
  }

  const statCards = [
    {
      title: 'Leads ทั้งหมด',
      value: formatNumber(stats.totalLeads),
      icon: Users,
      color: 'bg-blue-500',
      visible: hasRole(['sales', 'marketing', 'admin']),
      onClick: () => navigate('/leads'),
    },
    {
      title: 'ใบเสนอราคารอดำเนินการ',
      value: formatNumber(stats.activeQuotations),
      icon: FileText,
      color: 'bg-yellow-500',
      visible: hasRole(['sales', 'marketing', 'approver', 'admin']),
      onClick: () => navigate('/quotations'),
    },
    {
      title: 'สัญญาที่ใช้งานอยู่',
      value: formatNumber(stats.activeContracts),
      icon: ClipboardList,
      color: 'bg-green-500',
      visible: hasRole(['sales', 'planner', 'approver', 'admin']),
      onClick: () => navigate('/contracts'),
    },
    {
      title: 'งานรอดำเนินการ',
      value: formatNumber(stats.pendingJobs),
      icon: Wrench,
      color: 'bg-orange-500',
      visible: hasRole(['planner', 'technician', 'admin']),
      onClick: () => navigate('/jobs'),
    },
    {
      title: 'รายได้เดือนนี้',
      value: formatCurrency(stats.monthlyRevenue),
      icon: TrendingUp,
      color: 'bg-purple-500',
      visible: hasRole(['approver', 'admin']),
      onClick: () => navigate('/reports'),
    },
    {
      title: 'สัญญาใกล้หมดอายุ',
      value: formatNumber(stats.contractsExpiring30Days),
      icon: AlertTriangle,
      color: 'bg-red-500',
      visible: hasRole(['sales', 'approver', 'admin']),
      onClick: () => navigate('/contracts'),
    },
    {
      title: 'สต็อกต่ำกว่าขั้นต่ำ',
      value: formatNumber(stats.lowStockItems),
      icon: Package,
      color: 'bg-amber-500',
      visible: hasRole(['planner', 'admin']),
      onClick: () => navigate('/inventory'),
    },
    {
      title: 'รอการอนุมัติ',
      value: formatNumber(stats.pendingApprovals),
      icon: CheckCircle,
      color: 'bg-indigo-500',
      visible: hasRole(['approver', 'admin']),
      onClick: () => navigate('/approvals'),
    },
  ].filter(card => card.visible);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          สวัสดี, {user?.name}
        </h1>
        <p className="text-gray-500">
          ยินดีต้อนรับสู่ระบบบริหารจัดการ DACP
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={card.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  </div>
                  <div className={("w-12 h-12 rounded-lg flex items-center justify-center " + card.color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals (Approver) */}
        {hasRole(['approver', 'admin']) && (pendingQuotations.length > 0 || pendingContracts.length > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-500" />
                    รอการอนุมัติ
                  </CardTitle>
                  <p className="text-sm text-gray-500">ใบเสนอราคาและสัญญารอการอนุมัติ</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/approvals')}>
                  ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingQuotations.map(quote => {
                  return (
                    <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{quote.quote_number}</p>
                        <p className="text-xs text-gray-500">{quote.customers?.company_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(quote.total)}</p>
                        <Badge className={getStatusColor(quote.status)}>
                          รออนุมัติ
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {pendingContracts.map(contract => {
                  return (
                    <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{contract.contract_number}</p>
                        <p className="text-xs text-gray-500">{contract.customers?.company_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(contract.monthly_fee || 0)}/เดือน</p>
                        <Badge className={getStatusColor(contract.status)}>
                          รออนุมัติ
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contracts Expiring Soon */}
        {hasRole(['sales', 'approver', 'admin']) && expiringContracts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    สัญญาใกล้หมดอายุ
                  </CardTitle>
                  <p className="text-sm text-gray-500">สัญญาที่จะหมดอายุใน 60 วันถัดไป</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/contracts')}>
                  ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringContracts.map(contract => {
                  const daysUntil = calculateDaysUntil(contract.end_date);
                  return (
                    <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{contract.contract_number}</p>
                        <p className="text-xs text-gray-500">{contract.customers?.company_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">หมดอายุ {formatDate(contract.end_date)}</p>
                        <Badge variant={daysUntil <= 30 ? 'destructive' : 'default'}>
                          เหลือ {daysUntil} วัน
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Jobs (Technician) */}
        {hasRole(['technician']) && myJobs.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-500" />
                    งานของฉัน
                  </CardTitle>
                  <p className="text-sm text-gray-500">งานที่ได้รับมอบหมาย</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
                  ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myJobs.map(job => {
                  return (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{job.job_number}</p>
                        <p className="text-xs text-gray-500">{getStatusLabel(job.type)} - {job.customers?.company_name || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(job.scheduled_date)}</p>
                        <Badge className={getStatusColor(job.status)}>
                          {getStatusLabel(job.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Quotations (Sales) */}
        {hasRole(['sales']) && myLeads.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    ใบเสนอราคาล่าสุด
                  </CardTitle>
                  <p className="text-sm text-gray-500">ใบเสนอราคาล่าวุด</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/quotations')}>
                  ดูทั้งหมด <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myLeads.map(quote => {
                  return (
                    <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{quote.quote_number}</p>
                        <p className="text-xs text-gray-500">{quote.customers?.company_name}</p>
                      </div>
                      <div className="text-right">
                        {quote.total !== undefined && <p className="font-medium text-sm">{formatCurrency(quote.total)}</p>}
                        <Badge className={getStatusColor(quote.status)}>
                          {getStatusLabel(quote.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Revenue Chart Placeholder */}
        {hasRole(['approver', 'admin']) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                สรุปรายได้
              </CardTitle>
              <p className="text-sm text-gray-500">รายได้ประจำเดือน</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">เป้าหมายรายได้</span>
                    <span className="text-sm font-medium">{formatCurrency(stats.monthlyRevenue)} / {formatCurrency(200000)}</span>
                  </div>
                  <Progress value={(stats.monthlyRevenue / 200000) * 100} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">รายได้จากค่าเช่า</p>
                    <p className="text-lg font-semibold">{formatCurrency(stats.monthlyRevenue * 0.4)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">รายได้จากค่าแผ่น</p>
                    <p className="text-lg font-semibold">{formatCurrency(stats.monthlyRevenue * 0.6)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              ทางลัด
            </CardTitle>
            <p className="text-sm text-gray-500">การทำงานที่ใช้บ่อย</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {hasRole(['sales', 'admin']) && (
                <Button variant="outline" className="justify-start" onClick={() => navigate('/leads/new')}>
                  <Users className="w-4 h-4 mr-2" />
                  สร้าง Lead
                </Button>
              )}
              {hasRole(['marketing', 'admin']) && (
                <Button variant="outline" className="justify-start" onClick={() => navigate('/quotations/new')}>
                  <FileText className="w-4 h-4 mr-2" />
                  สร้างใบเสนอราคา
                </Button>
              )}
              {hasRole(['planner', 'admin']) && (
                <Button variant="outline" className="justify-start" onClick={() => navigate('/jobs/new')}>
                  <Wrench className="w-4 h-4 mr-2" />
                  สร้างงาน
                </Button>
              )}
              {hasRole(['planner', 'admin']) && (
                <Button variant="outline" className="justify-start" onClick={() => navigate('/inventory')}>
                  <Package className="w-4 h-4 mr-2" />
                  ตรวจสต็อก
                </Button>
              )}
              {hasRole(['approver', 'admin']) && (
                <Button variant="outline" className="justify-start" onClick={() => navigate('/approvals')}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  อนุมัติ
                </Button>
              )}
              {hasRole(['technician']) && (
                <Button variant="outline" className="justify-start" onClick={() => navigate('/jobs')}>
                  <Wrench className="w-4 h-4 mr-2" />
                  งานของฉัน
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
