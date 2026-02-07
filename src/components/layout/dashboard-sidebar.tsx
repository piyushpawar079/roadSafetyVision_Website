// ===========================================
// DASHBOARD SIDEBAR NAVIGATION
// ===========================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/lib/utils';
import {
  LayoutDashboard,
  FileWarning,
  Users,
  CreditCard,
  Settings,
  Shield,
  UserCheck,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'admin', 'citizen'],
  },
  {
    title: 'Violations',
    href: '/dashboard/violations',
    icon: FileWarning,
    roles: ['super_admin', 'admin', 'citizen'],
  },
  {
    title: 'Payments',
    href: '/dashboard/payments',
    icon: CreditCard,
    roles: ['citizen'],
  },
  {
    title: 'Admin Requests',
    href: '/dashboard/admin-requests',
    icon: UserCheck,
    roles: ['super_admin'],
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
    roles: ['super_admin', 'admin'],
  },
];

interface DashboardSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function DashboardSidebar({ 
  collapsed = false, 
  onCollapsedChange 
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role || 'citizen';

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const getDashboardHref = () => {
    switch (userRole) {
      case 'super_admin':
        return '/dashboard/super-admin';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/dashboard/citizen';
    }
  };

  const getHref = (item: NavItem) => {
    if (item.href === '/dashboard') {
      return getDashboardHref();
    }
    return item.href;
  };

  const isActive = (item: NavItem) => {
    const href = getHref(item);
    if (item.href === '/dashboard') {
      return pathname === href || 
             pathname === '/dashboard/citizen' ||
             pathname === '/dashboard/admin' ||
             pathname === '/dashboard/super-admin';
    }
    return pathname === href || pathname?.startsWith(`${item.href}/`);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/">
            <Logo size="sm" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', collapsed && 'mx-auto')}
          onClick={() => onCollapsedChange?.(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="flex flex-col h-full">
          {/* Nav Items */}
          <nav className="space-y-1 px-2 py-4">
            {filteredNavItems.map((item) => {
              const href = getHref(item);
              const active = isActive(item);

              return (
                <Link key={item.href} href={href}>
                  <Button
                    variant={active ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      collapsed && 'justify-center px-2',
                      active &&
                        'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Section */}
          <div className="p-4 space-y-4">
            {/* Role Badge */}
            {!collapsed && (
              <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold capitalize">
                    {userRole.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {userRole === 'super_admin' &&
                    'Full system access and control'}
                  {userRole === 'admin' &&
                    'Manage violations and review plates'}
                  {userRole === 'citizen' && 'View your violations and pay fines'}
                </p>
              </div>
            )}

            {/* Help Link */}
            {/* {!collapsed && (
              <Link href="/help">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Help & Support
                </Button>
              </Link>
            )} */}

            <Separator />

            {/* User Profile & Logout */}
            <div className={cn('space-y-2', collapsed && 'px-0')}>
              {!collapsed ? (
                <div className="flex items-center gap-3 px-2 py-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(session?.user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">
                      {session?.user?.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(session?.user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {/* <Link href="/dashboard/profile">
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <User className="h-4 w-4" />
                  {!collapsed && <span>Profile</span>}
                </Button>
              </Link> */}

              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 text-red-600 hover:text-red-600 hover:bg-red-50',
                  collapsed && 'justify-center px-2'
                )}
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Sign Out</span>}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}