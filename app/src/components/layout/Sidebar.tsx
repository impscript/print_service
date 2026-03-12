import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  Settings,
  CheckCircle,
  Package,
  Wrench,
  TrendingUp,
  Building,
  MapPin,
  Printer,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
  module: string;
}

const navItems: NavItem[] = [
  { label: 'แดชบอร์ด', path: '/', icon: LayoutDashboard, roles: ['sales', 'marketing', 'approver', 'planner', 'technician', 'admin'], module: 'dashboard' },
  { label: 'ลูกค้า', path: '/customers', icon: Building, roles: ['sales', 'admin'], module: 'customers' },
  { label: 'สถานที่', path: '/sites', icon: MapPin, roles: ['sales', 'admin'], module: 'sites' },
  { label: 'Leads', path: '/leads', icon: Users, roles: ['sales', 'marketing', 'admin'], module: 'leads' },
  { label: 'ใบเสนอราคา', path: '/quotations', icon: FileText, roles: ['sales', 'marketing', 'approver', 'admin'], module: 'quotations' },
  { label: 'สัญญา', path: '/contracts', icon: ClipboardList, roles: ['sales', 'planner', 'approver', 'admin'], module: 'contracts' },
  { label: 'อนุมัติ', path: '/approvals', icon: CheckCircle, roles: ['approver', 'admin'], module: 'approvals' },
  { label: 'งาน', path: '/jobs', icon: Wrench, roles: ['planner', 'technician', 'admin'], module: 'jobs' },
  { label: 'เครื่องจักร', path: '/machines', icon: Printer, roles: ['planner', 'marketing', 'admin'], module: 'machines' },
  { label: 'สต็อก', path: '/inventory', icon: Package, roles: ['planner', 'marketing', 'admin'], module: 'inventory' },
  { label: 'สินค้า', path: '/products', icon: Printer, roles: ['marketing', 'admin'], module: 'products' },
  { label: 'ราคา', path: '/pricing', icon: DollarSign, roles: ['marketing', 'admin'], module: 'pricing' },
  { label: 'ใบแจ้งหนี้', path: '/invoices', icon: FileText, roles: ['marketing', 'admin'], module: 'invoices' },
  { label: 'รายงาน', path: '/reports', icon: TrendingUp, roles: ['approver', 'admin'], module: 'reports' },
  { label: 'ผู้ใช้งาน', path: '/admin/users', icon: Users, roles: ['admin', 'sales', 'marketing'], module: 'users' },
  { label: 'การตั้งค่า', path: '/settings', icon: Settings, roles: ['admin'], module: 'settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, canAccess } = useAuth();

  const filteredNavItems = navItems.filter(item =>
    user && item.roles.includes(user.role) && canAccess(item.module)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 flex flex-col group",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Floating Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-6 h-6 w-6 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-100 p-0 z-50 hidden md:flex items-center justify-center transition-opacity",
          !collapsed && "opacity-0 group-hover:opacity-100"
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>

      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <div className={cn(
          "flex items-center gap-2 transition-all duration-300",
          collapsed ? "justify-center w-full" : ""
        )}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Printer className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-gray-900 whitespace-nowrap overflow-hidden">
              DACP
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-blue-700" : "text-gray-500")} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && user && (
          <div className="mb-4 px-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? 'ออกจากระบบ' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>ออกจากระบบ</span>}
        </Button>
      </div>
    </div>
  );
}
