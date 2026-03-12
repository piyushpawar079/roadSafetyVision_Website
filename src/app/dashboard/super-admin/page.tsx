// ===========================================
// SUPER ADMIN DASHBOARD PAGE
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/ui/page-header';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { RecentViolations } from '@/components/dashboard/recent-violations';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { AdminRequestCard } from '@/components/admin/admin-request-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';
import { Violation, AdminRequest, User } from '@/types';
import {
  Users,
  UserCheck,
  ArrowRight,
  Shield,
  FileWarning,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminDashboardPage() {
  const { data: session } = useSession();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [violationsRes, requestsRes, usersRes] = await Promise.all([
        fetch('/api/violations'),
        fetch('/api/admin-requests?status=pending'),
        fetch('/api/users'),
      ]);

      const violationsData = await violationsRes.json();
      const requestsData = await requestsRes.json();
      const usersData = await usersRes.json();

      if (violationsData.success) setViolations(violationsData.data || []);
      if (requestsData.success) setAdminRequests(requestsData.data || []);
      if (usersData.success) setUsers(usersData.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = violations
    .filter((v) => v.payment_status === 'PAID')
    .reduce((sum, v) => sum + v.total_fine, 0);

  const stats = {
    totalViolations: violations.length,
    totalUsers: users.filter((u) => u.role === 'citizen').length,
    pendingRequests: adminRequests.length,
    paidFines: totalCollected,
    pendingPayments: violations[0]?.total_fine - totalCollected,
    totalFineAmount: violations[0]?.total_fine
  };

  // Chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];

    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      violations: violations.filter((v) => v.date === dateStr).length,
      payments: violations.filter(
        (v) => v.payment_status === 'PAID' && v.date === dateStr
      ).length,
    };
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Super Admin Dashboard"
        description="Complete system overview and management controls."
      >
        {/* <div className="flex gap-2">
          <Link href="/dashboard/users">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div> */}
      </PageHeader>

      {/* Pending Admin Requests Alert */}
      {adminRequests.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">
                  {adminRequests.length} pending admin request
                  {adminRequests.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-blue-700">
                  Review and approve or reject admin access requests
                </p>
              </div>
            </div>
            <Link href="/dashboard/admin-requests">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Review Requests
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <StatsOverview stats={stats} role="super_admin" />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Violations */}
        <div className="lg:col-span-2">
          <RecentViolations
            violations={violations.slice(0, 6)}
            title="System-wide Violations"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Admin Requests */}
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Admin Requests
              </CardTitle>
              {adminRequests.length > 0 && (
                <Badge>{adminRequests.length}</Badge>
              )}
            </CardHeader>
            <CardContent>
              {adminRequests.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No pending requests
                </div>
              ) : (
                <div className="space-y-3">
                  {adminRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium text-sm">{request.user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.user_email}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        Pending
                      </Badge>
                    </div>
                  ))}
                  {adminRequests.length > 3 && (
                    <Link href="/dashboard/admin-requests">
                      <Button variant="ghost" size="sm" className="w-full">
                        View all ({adminRequests.length})
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card> */}

          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Citizens</span>
                <span className="font-medium">
                  {users.filter((u) => u.role === 'citizen').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Admins</span>
                <span className="font-medium">
                  {users.filter((u) => u.role === 'admin').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Verified Emails</span>
                <span className="font-medium">
                  {users.filter((u) => u.emailVerified).length}
                </span>
              </div>
              <div className="border-t pt-4">
                <Link href="/dashboard/users">
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Summary */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalCollected)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-lg font-semibold">
                      {violations.filter((v) => v.payment_status === 'PAID').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Paid</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-lg font-semibold">
                      {violations.filter((v) => v.payment_status === 'PENDING').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* Activity Chart */}
      {/* <ActivityChart data={chartData} title="System Activity (Last 7 Days)" /> */}
    </div>
  );
}