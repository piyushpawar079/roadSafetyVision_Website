// ===========================================
// DASHBOARD STATS OVERVIEW COMPONENT
// ===========================================

'use client';

import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency } from '@/lib/utils';
import {
  FileWarning,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  IndianRupee,
} from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalViolations: number;
    pendingPayments: number;
    paidFines: number;
    totalFineAmount: number;
    pendingReview?: number;
    totalUsers?: number;
    pendingRequests?: number;
    totalCollected?: number;
  };
  role: 'citizen' | 'admin' | 'super_admin';
}

export function StatsOverview({ stats, role }: StatsOverviewProps) {
  if (role === 'citizen') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Violations"
          value={stats.totalViolations}
          description="All time violations"
          icon={FileWarning}
          iconClassName="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          description="Violations awaiting payment"
          icon={Clock}
          iconClassName="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Paid Fines"
          value={stats.paidFines}
          description="Successfully paid"
          icon={CheckCircle}
          iconClassName="bg-green-100 text-green-600"
        />
        <StatCard
          title="Total Due"
          value={formatCurrency(stats.totalFineAmount)}
          description="Outstanding amount"
          icon={IndianRupee}
          iconClassName="bg-red-100 text-red-600"
        />
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Violations"
          value={stats.totalViolations}
          description="All recorded violations"
          icon={FileWarning}
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Pending Review"
          value={stats.pendingReview || 0}
          description="Needs plate verification"
          icon={AlertTriangle}
          iconClassName="bg-orange-100 text-orange-600"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          description="Awaiting payment"
          icon={Clock}
          iconClassName="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Paid Today"
          value={stats.paidFines}
          description="Fines collected today"
          icon={CheckCircle}
          iconClassName="bg-green-100 text-green-600"
        />
      </div>
    );
  }

  // Super Admin Stats
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Violations"
        value={stats.totalViolations}
        description="System-wide violations"
        icon={FileWarning}
        iconClassName="bg-blue-100 text-blue-600"
        // trend={{ value: 12, isPositive: false }}
      />
      <StatCard
        title="Total Users"
        value={stats.totalUsers || 0}
        description="Registered citizens"
        icon={Users}
        iconClassName="bg-purple-100 text-purple-600"
        // trend={{ value: 8, isPositive: true }}
      />
      <StatCard
        title="Pending Requests"
        value={stats.pendingRequests || 0}
        description="Admin access requests"
        icon={Clock}
        iconClassName="bg-orange-100 text-orange-600"
      />
      <StatCard
        title="Total Collected"
        value={formatCurrency(stats.totalCollected || 0)}
        description="Fine revenue"
        icon={TrendingUp}
        iconClassName="bg-green-100 text-green-600"
        // trend={{ value: 15, isPositive: true }}
      />
    </div>
  );
}