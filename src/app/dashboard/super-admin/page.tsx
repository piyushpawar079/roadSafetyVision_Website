// // ===========================================
// // SUPER ADMIN DASHBOARD PAGE
// // ===========================================

// 'use client';

// import { useEffect, useState } from 'react';
// import { useSession } from 'next-auth/react';
// import { PageHeader } from '@/components/ui/page-header';
// import { StatsOverview } from '@/components/dashboard/stats-overview';
// import { RecentViolations } from '@/components/dashboard/recent-violations';
// import { ActivityChart } from '@/components/dashboard/activity-chart';
// import { AdminRequestCard } from '@/components/admin/admin-request-card';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { LoadingSpinner } from '@/components/ui/loading-spinner';
// import { EmptyState } from '@/components/ui/empty-state';
// import { formatCurrency } from '@/lib/utils';
// import { Violation, AdminRequest, User } from '@/types';
// import {
//   Users,
//   UserCheck,
//   ArrowRight,
//   Shield,
//   FileWarning,
//   Settings,
// } from 'lucide-react';
// import Link from 'next/link';

// export default function SuperAdminDashboardPage() {
//   const { data: session } = useSession();
//   const [violations, setViolations] = useState<Violation[]>([]);
//   const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [violationsRes, requestsRes, usersRes] = await Promise.all([
//         fetch('/api/violations'),
//         fetch('/api/admin-requests?status=pending'),
//         fetch('/api/users'),
//       ]);

//       const violationsData = await violationsRes.json();
//       const requestsData = await requestsRes.json();
//       const usersData = await usersRes.json();

//       if (violationsData.success) setViolations(violationsData.data || []);
//       if (requestsData.success) setAdminRequests(requestsData.data || []);
//       if (usersData.success) setUsers(usersData.data || []);
//     } catch (error) {
//       console.error('Failed to fetch data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const totalCollected = violations
//     .filter((v) => v.payment_status === 'PAID')
//     .reduce((sum, v) => sum + v.total_fine, 0);

//   const stats = {
//     totalViolations: violations.length,
//     totalUsers: users.filter((u) => u.role === 'citizen').length,
//     pendingRequests: adminRequests.length,
//     paidFines: totalCollected,
//     pendingPayments: violations[0]?.total_fine - totalCollected,
//     totalFineAmount: violations[0]?.total_fine
//   };

//   // Chart data
//   const chartData = Array.from({ length: 7 }, (_, i) => {
//     const date = new Date();
//     date.setDate(date.getDate() - (6 - i));
//     const dateStr = date.toISOString().split('T')[0];

//     return {
//       name: date.toLocaleDateString('en-US', { weekday: 'short' }),
//       violations: violations.filter((v) => v.date === dateStr).length,
//       payments: violations.filter(
//         (v) => v.payment_status === 'PAID' && v.date === dateStr
//       ).length,
//     };
//   });

//   if (loading) {
//     return (
//       <div className="flex h-[50vh] items-center justify-center">
//         <LoadingSpinner size="lg" text="Loading dashboard..." />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <PageHeader
//         title="Super Admin Dashboard"
//         description="Complete system overview and management controls."
//       >
//         {/* <div className="flex gap-2">
//           <Link href="/dashboard/users">
//             <Button variant="outline">
//               <Users className="mr-2 h-4 w-4" />
//               Manage Users
//             </Button>
//           </Link>
//           <Link href="/dashboard/settings">
//             <Button>
//               <Settings className="mr-2 h-4 w-4" />
//               Settings
//             </Button>
//           </Link>
//         </div> */}
//       </PageHeader>

//       {/* Pending Admin Requests Alert */}
//       {adminRequests.length > 0 && (
//         <Card className="border-blue-200 bg-blue-50">
//           <CardContent className="flex items-center justify-between p-4">
//             <div className="flex items-center gap-3">
//               <div className="rounded-full bg-blue-100 p-2">
//                 <UserCheck className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="font-medium text-blue-900">
//                   {adminRequests.length} pending admin request
//                   {adminRequests.length > 1 ? 's' : ''}
//                 </p>
//                 <p className="text-sm text-blue-700">
//                   Review and approve or reject admin access requests
//                 </p>
//               </div>
//             </div>
//             <Link href="/dashboard/admin-requests">
//               <Button className="bg-blue-600 hover:bg-blue-700">
//                 Review Requests
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       )}

//       {/* Stats Overview */}
//       <StatsOverview stats={stats} role="super_admin" />

//       {/* Main Content */}
//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Recent Violations */}
//         <div className="lg:col-span-2">
//           <RecentViolations
//             violations={violations.slice(0, 6)}
//             title="System-wide Violations"
//           />
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* Pending Admin Requests */}
//           {/* <Card>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <Shield className="h-5 w-5 text-primary" />
//                 Admin Requests
//               </CardTitle>
//               {adminRequests.length > 0 && (
//                 <Badge>{adminRequests.length}</Badge>
//               )}
//             </CardHeader>
//             <CardContent>
//               {adminRequests.length === 0 ? (
//                 <div className="py-4 text-center text-sm text-muted-foreground">
//                   No pending requests
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {adminRequests.slice(0, 3).map((request) => (
//                     <div
//                       key={request.id}
//                       className="flex items-center justify-between rounded-lg border p-3"
//                     >
//                       <div>
//                         <p className="font-medium text-sm">{request.user_name}</p>
//                         <p className="text-xs text-muted-foreground">
//                           {request.user_email}
//                         </p>
//                       </div>
//                       <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
//                         Pending
//                       </Badge>
//                     </div>
//                   ))}
//                   {adminRequests.length > 3 && (
//                     <Link href="/dashboard/admin-requests">
//                       <Button variant="ghost" size="sm" className="w-full">
//                         View all ({adminRequests.length})
//                         <ArrowRight className="ml-1 h-4 w-4" />
//                       </Button>
//                     </Link>
//                   )}
//                 </div>
//               )}
//             </CardContent>
//           </Card> */}

//           {/* User Stats */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">User Overview</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">Total Citizens</span>
//                 <span className="font-medium">
//                   {users.filter((u) => u.role === 'citizen').length}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">Total Admins</span>
//                 <span className="font-medium">
//                   {users.filter((u) => u.role === 'admin').length}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">Verified Emails</span>
//                 <span className="font-medium">
//                   {users.filter((u) => u.emailVerified).length}
//                 </span>
//               </div>
//               <div className="border-t pt-4">
//                 <Link href="/dashboard/users">
//                   <Button variant="outline" size="sm" className="w-full">
//                     <Users className="mr-2 h-4 w-4" />
//                     Manage Users
//                   </Button>
//                 </Link>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Revenue Summary */}
//           {/* <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Revenue Summary</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Total Collected</p>
//                   <p className="text-2xl font-bold text-green-600">
//                     {formatCurrency(totalCollected)}
//                   </p>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4 text-center">
//                   <div className="rounded-lg bg-muted/50 p-3">
//                     <p className="text-lg font-semibold">
//                       {violations.filter((v) => v.payment_status === 'PAID').length}
//                     </p>
//                     <p className="text-xs text-muted-foreground">Paid</p>
//                   </div>
//                   <div className="rounded-lg bg-muted/50 p-3">
//                     <p className="text-lg font-semibold">
//                       {violations.filter((v) => v.payment_status === 'PENDING').length}
//                     </p>
//                     <p className="text-xs text-muted-foreground">Pending</p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card> */}
//         </div>
//       </div>

//       {/* Activity Chart */}
//       {/* <ActivityChart data={chartData} title="System Activity (Last 7 Days)" /> */}
//     </div>
//   );
// }


// src/app/dashboard/super-admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  IndianRupee,
  TrendingUp,
  Clock,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { PaymentCard } from '@/components/payments/payment-card';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalViolations: 0,
    pendingViolations: 0,
    paidViolations: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    totalPayments: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentViolations, setRecentViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch violations
      const violationsRes = await fetch('/api/violations');
      const violationsData = await violationsRes.json();
      
      // Fetch payments
      const paymentsRes = await fetch('/api/payments?limit=6');
      const paymentsData = await paymentsRes.json();
      
      // Fetch users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();

      if (violationsData.success) {
        const violations = violationsData.data || [];
        const pending = violations.filter((v: any) => v.payment_status === 'PENDING');
        const paid = violations.filter((v: any) => v.payment_status === 'PAID');
        
        const pendingAmount = pending.reduce((sum: number, v: any) => sum + (v.total_fine || 0), 0);
        const paidAmount = paid.reduce((sum: number, v: any) => sum + (v.total_fine || 0), 0);

        setStats(prev => ({
          ...prev,
          totalViolations: violations.length,
          pendingViolations: pending.length,
          paidViolations: paid.length,
          pendingAmount,
          totalRevenue: paidAmount,
        }));

        setRecentViolations(violations.slice(0, 5));
      }

      if (paymentsData.success) {
        setRecentPayments(paymentsData.data || []);
        setStats(prev => ({
          ...prev,
          totalPayments: paymentsData.meta?.stats?.total_payments || 0,
        }));
      }

      if (usersData.success) {
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.data?.length || 0,
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          System overview and statistics
        </p>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.totalUsers}</span>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.totalViolations}</span>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex gap-2 mt-2 text-sm">
              <Badge variant="destructive">{stats.pendingViolations} Pending</Badge>
              <Badge className="bg-green-500">{stats.paidViolations} Paid</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-600">
                {stats.totalPayments}
              </span>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-600">
                {formatCurrency(stats.pendingAmount)}
              </span>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {stats.pendingViolations} violations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              From {stats.paidViolations} paid violations
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalViolations > 0 
                ? Math.round((stats.paidViolations / stats.totalViolations) * 100) 
                : 0}%
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {stats.paidViolations} of {stats.totalViolations} violations paid
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Average Fine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(
                stats.totalViolations > 0 
                  ? (stats.totalRevenue + stats.pendingAmount) / stats.totalViolations 
                  : 0
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Per violation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  Recent Payments
                </CardTitle>
                <CardDescription className="mt-1">
                  Latest payment transactions
                </CardDescription>
              </div>
              <Badge className="bg-green-500 text-lg px-4 py-2">
                {stats.totalPayments} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPayments.map((payment) => (
                <PaymentCard 
                  key={payment.id} 
                  payment={payment} 
                  showUserDetails={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Violations */}
      {recentViolations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Recent Violations
            </CardTitle>
            <CardDescription className="mt-1">
              Latest detected violations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentViolations.map((violation) => (
                <div 
                  key={violation.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{violation.violation_id}</p>
                      <Badge 
                        variant={violation.payment_status === 'PAID' ? 'default' : 'destructive'}
                        className={violation.payment_status === 'PAID' ? 'bg-green-500' : ''}
                      >
                        {violation.payment_status === 'PAID' ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {violation.vehicle.license_plate} • {formatDate(violation.timestamp)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {violation.violations.map((v: any) => v.type).join(', ')}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-lg">
                      {formatCurrency(violation.total_fine)}
                    </p>
                    {violation.citizen_name && (
                      <p className="text-sm text-gray-600">{violation.citizen_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}