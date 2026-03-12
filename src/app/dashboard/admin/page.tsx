// ===========================================
// ADMIN DASHBOARD PAGE
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
import { Violation } from '@/types';
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  CheckCircle,
  Clock,
  FileWarning,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
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

  const pendingReview = violations.filter(
    (v) => v.vehicle.plate_status === 'MANUAL_REVIEW'
  );
  const unidentified = violations.filter(
    (v) => v.vehicle.plate_status === 'UNIDENTIFIED'
  );
  const pendingPayments = violations.filter(
    (v) => v.payment_status === 'PENDING'
  );
  const paidToday = violations.filter((v) => {
    const today = new Date().toISOString().split('T')[0];
    return v.payment_status === 'PAID' && v.date === today;
  });

  const stats = {
    totalViolations: violations.length,
    totalFineAmount: violations[0]?.total_fine,
    pendingReview: pendingReview.length + unidentified.length,
    pendingPayments: pendingPayments.length,
    paidFines: paidToday.length,
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
        title={`Welcome, ${session?.user?.name?.split(' ')[0] || 'Admin'}!`}
        description="Manage violations, review plates, and monitor traffic compliance."
      >
        <Link href="/dashboard/violations">
          <Button>
            <Eye className="mr-2 h-4 w-4" />
            View All Violations
          </Button>
        </Link>
      </PageHeader>

      {/* Alert for Pending Reviews */}
      {pendingReview.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 p-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-900">
                  {pendingReview.length} violation
                  {pendingReview.length > 1 ? 's' : ''} need plate verification
                </p>
                <p className="text-sm text-yellow-700">
                  Review and correct license plates for proper notification
                </p>
              </div>
            </div>
            <Link href="/dashboard/violations?plate_status=MANUAL_REVIEW">
              <Button variant="outline" className="border-yellow-300 hover:bg-yellow-100">
                Review Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <StatsOverview stats={stats} role="admin" />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Violations Needing Review */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Pending Plate Review
              </CardTitle>
              <Link href="/dashboard/violations?plate_status=MANUAL_REVIEW">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {pendingReview.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="mt-3 font-medium text-green-700">All caught up!</p>
                  <p className="text-sm text-muted-foreground">
                    No violations pending review
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReview.slice(0, 5).map((violation) => (
                    <Link
                      key={violation.violation_id}
                      href={`/dashboard/violations/${violation.violation_id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between rounded-lg border p-3 transition-all hover:border-primary hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-yellow-100 p-2">
                            <FileWarning className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-medium">
                              {violation.vehicle.license_plate}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {violation.location.junction_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            Review Needed
                          </Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            OCR: {Math.round(violation.vehicle.ocr_confidence * 100)}%
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plate Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Verified</span>
                </div>
                <span className="font-medium">
                  {violations.filter((v) => v.vehicle.plate_status === 'VERIFIED').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Manual Review</span>
                </div>
                <span className="font-medium">{pendingReview.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">Unidentified</span>
                </div>
                <span className="font-medium">{unidentified.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {pendingPayments.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Paid</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {violations.filter((v) => v.payment_status === 'PAID').length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">New Violations</span>
                  <span className="font-medium">
                    {violations.filter((v) => v.date === new Date().toISOString().split('T')[0]).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plates Verified</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fines Collected</span>
                  <span className="font-medium">{paidToday.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityChart data={chartData} title="Violations & Payments (7 Days)" />
        <RecentViolations
          violations={violations.slice(0, 5)}
          title="Latest Violations"
        />
      </div>
    </div>
  );
}