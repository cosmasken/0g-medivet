import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  FileText,
  User,
  ShoppingCart,
  Settings,
  Activity,
  Shield,
  DollarSign,
  Users,
  CreditCard,
  Store,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const { currentUser } = useAuthStore();
  const location = useLocation();

  const getNavigationItems = () => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case 'Patient':
        return [
          { icon: Activity, label: 'Dashboard', path: '/patient/dashboard' },
          { icon: User, label: 'Profile', path: '/patient/profile' },
          { icon: CreditCard, label: 'Billing', path: '/patient/billing' },
          { icon: DollarSign, label: 'Marketplace', path: '/marketplace' },
          { icon: History, label: 'Audit Log', path: '/audit-log' },
        ];
      case 'Provider':
        return [
          { icon: FileText, label: 'Dashboard', path: '/provider/dashboard' },
          { icon: ShoppingCart, label: 'Purchased', path: '/provider/purchased' },
          { icon: Store, label: 'Marketplace', path: '/marketplace' },
          { icon: User, label: 'Profile', path: '/provider/profile' },
          { icon: History, label: 'Audit Log', path: '/audit-log' },
        ];
      case 'Admin':
        return [
          { icon: Shield, label: 'Admin Panel', path: '/admin' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: History, label: 'Audit Log', path: '/audit-log' },
          { icon: User, label: 'Profile', path: '/admin/profile' },
          { icon: ShoppingCart, label: 'Marketplace', path: '/marketplace' },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <aside className="w-64 medical-card border-r border-border h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start medical-transition",
                  isActive && "medical-shadow"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;