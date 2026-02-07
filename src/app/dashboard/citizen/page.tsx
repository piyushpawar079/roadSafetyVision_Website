// ===========================================
// CITIZEN DASHBOARD PAGE
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/ui/page-header';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { RecentViolations } from '@/components/dashboard/recent-violations';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';
import { Violation } from '@/types';
import {
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Shield,
  Bell,
  FileWarning,
} from 'lucide-react';
import Link from 'next/link';

export default function CitizenDashboardPage() {
  const { data: session } = useSession();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      const response = await fetch('/api/violations');
      const result = await response.json();
      if (result.success) {
        setViolations(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingViolations = violations.filter(
    (v) => v.payment_status === 'PENDING'
  );
  const paidViolations = violations.filter((v) => v.payment_status === 'PAID');
  const totalPendingAmount = pendingViolations.reduce(
    (sum, v) => sum + v.total_fine,
    0
  );

  const stats = {
    totalViolations: violations.length,
    pendingPayments: pendingViolations.length,
    paidFines: paidViolations.length,
    totalFineAmount: totalPendingAmount,
  };

  // Generate chart data (last 7 days)
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
        title={`Welcome back, ${session?.user?.name?.split(' ')[0] || 'User'}!`}
        description="Here's an overview of your traffic violations and payments."
      />

      {/* Alert Banner for Pending Payments */}
      {pendingViolations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-orange-900">
                  You have {pendingViolations.length} pending violation
                  {pendingViolations.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-orange-700">
                  Total due: {formatCurrency(totalPendingAmount)}
                </p>
              </div>
            </div>
            <Link href="/dashboard/payments">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Pay Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <StatsOverview stats={stats} role="citizen" />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Violations */}
        <div className="lg:col-span-2">
          {violations.length > 0 ? (
            <RecentViolations
              violations={violations.slice(0, 5)}
              title="Your Violations"
              viewAllHref="/dashboard/violations"
            />
          ) : (
            <Card>
              <CardContent className="p-8">
                <EmptyState
                  icon={FileWarning}
                  title="No violations found"
                  description="You don't have any recorded traffic violations. Keep driving safely!"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/violations" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileWarning className="mr-2 h-4 w-4" />
                  View All Violations
                </Button>
              </Link>
              <Link href="/dashboard/payments" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment History
                </Button>
              </Link>
              <Link href="/dashboard/notifications" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
              </Link>
            </CardContent>
          </Card> */}

          {/* Request Admin Access */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Are you a Traffic Officer?</h4>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Request admin access to manage violations and review plates.
              </p>
              <Link href="/dashboard/request-admin">
                <Button variant="outline" size="sm" className="w-full">
                  Request Admin Access
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Pending Fines
                  </span>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {pendingViolations.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Paid Fines
                  </span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {paidViolations.length}
                  </Badge>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Amount Due</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(totalPendingAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Chart */}
      {violations.length > 0 && (
        <ActivityChart data={chartData} title="Your Activity (Last 7 Days)" />
      )}
    </div>
  );
}