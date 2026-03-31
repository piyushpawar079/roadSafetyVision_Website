// // ===========================================
// // CITIZEN DASHBOARD PAGE
// // ===========================================

// 'use client';

// import { useEffect, useState } from 'react';
// import { useSession } from 'next-auth/react';
// import { PageHeader } from '@/components/ui/page-header';
// import { StatsOverview } from '@/components/dashboard/stats-overview';
// import { RecentViolations } from '@/components/dashboard/recent-violations';
// import { ActivityChart } from '@/components/dashboard/activity-chart';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { LoadingSpinner } from '@/components/ui/loading-spinner';
// import { EmptyState } from '@/components/ui/empty-state';
// import { formatCurrency } from '@/lib/utils';
// import { Violation } from '@/types';
// import {
//   CreditCard,
//   AlertTriangle,
//   ArrowRight,
//   Shield,
//   Bell,
//   FileWarning,
// } from 'lucide-react';
// import Link from 'next/link';

// export default function CitizenDashboardPage() {
//   const { data: session } = useSession();
//   const [violations, setViolations] = useState<Violation[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchViolations();
//   }, []);

//   const fetchViolations = async () => {
//     try {
//       const response = await fetch('/api/violations');
//       const result = await response.json();
//       if (result.success) {
//         setViolations(result.data || []);
//       }
//     } catch (error) {
//       console.error('Failed to fetch violations:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const pendingViolations = violations.filter(
//     (v) => v.payment_status === 'PENDING'
//   );
//   const paidViolations = violations.filter((v) => v.payment_status === 'PAID');
//   const totalPendingAmount = pendingViolations.reduce(
//     (sum, v) => sum + v.total_fine,
//     0
//   );

//   const stats = {
//     totalViolations: violations.length,
//     pendingPayments: pendingViolations.length,
//     paidFines: paidViolations.length,
//     totalFineAmount: totalPendingAmount,
//   };

//   // Generate chart data (last 7 days)
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
//         title={`Welcome back, ${session?.user?.name?.split(' ')[0] || 'User'}!`}
//         description="Here's an overview of your traffic violations and payments."
//       />

//       {/* Alert Banner for Pending Payments */}
//       {pendingViolations.length > 0 && (
//         <Card className="border-orange-200 bg-orange-50">
//           <CardContent className="flex items-center justify-between p-4">
//             <div className="flex items-center gap-3">
//               <div className="rounded-full bg-orange-100 p-2">
//                 <AlertTriangle className="h-5 w-5 text-orange-600" />
//               </div>
//               <div>
//                 <p className="font-medium text-orange-900">
//                   You have {pendingViolations.length} pending violation
//                   {pendingViolations.length > 1 ? 's' : ''}
//                 </p>
//                 <p className="text-sm text-orange-700">
//                   Total due: {formatCurrency(totalPendingAmount)}
//                 </p>
//               </div>
//             </div>
//             <Link href="/dashboard/payments">
//               <Button className="bg-orange-600 hover:bg-orange-700">
//                 Pay Now
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       )}

//       {/* Stats Overview */}
//       <StatsOverview stats={stats} role="citizen" />

//       {/* Main Content Grid */}
//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Recent Violations */}
//         <div className="lg:col-span-2">
//           {violations.length > 0 ? (
//             <RecentViolations
//               violations={violations.slice(0, 5)}
//               title="Your Violations"
//               viewAllHref="/dashboard/violations"
//             />
//           ) : (
//             <Card>
//               <CardContent className="p-8">
//                 <EmptyState
//                   icon={FileWarning}
//                   title="No violations found"
//                   description="You don't have any recorded traffic violations. Keep driving safely!"
//                 />
//               </CardContent>
//             </Card>
//           )}
//         </div>

//         {/* Quick Actions & Info */}
//         <div className="space-y-6">
//           {/* Quick Actions */}
//           {/* <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Quick Actions</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Link href="/dashboard/violations" className="block">
//                 <Button variant="outline" className="w-full justify-start">
//                   <FileWarning className="mr-2 h-4 w-4" />
//                   View All Violations
//                 </Button>
//               </Link>
//               <Link href="/dashboard/payments" className="block">
//                 <Button variant="outline" className="w-full justify-start">
//                   <CreditCard className="mr-2 h-4 w-4" />
//                   Payment History
//                 </Button>
//               </Link>
//               <Link href="/dashboard/notifications" className="block">
//                 <Button variant="outline" className="w-full justify-start">
//                   <Bell className="mr-2 h-4 w-4" />
//                   Notifications
//                 </Button>
//               </Link>
//             </CardContent>
//           </Card> */}

//           {/* Request Admin Access */}
//           <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
//             <CardContent className="p-6">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="rounded-lg bg-primary/10 p-2">
//                   <Shield className="h-5 w-5 text-primary" />
//                 </div>
//                 <div>
//                   <h4 className="font-semibold">Are you a Traffic Officer?</h4>
//                 </div>
//               </div>
//               <p className="text-sm text-muted-foreground mb-4">
//                 Request admin access to manage violations and review plates.
//               </p>
//               <Link href="/dashboard/request-admin">
//                 <Button variant="outline" size="sm" className="w-full">
//                   Request Admin Access
//                 </Button>
//               </Link>
//             </CardContent>
//           </Card>

//           {/* Recent Activity Summary */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Payment Summary</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-muted-foreground">
//                     Pending Fines
//                   </span>
//                   <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
//                     {pendingViolations.length}
//                   </Badge>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-muted-foreground">
//                     Paid Fines
//                   </span>
//                   <Badge variant="outline" className="bg-green-50 text-green-700">
//                     {paidViolations.length}
//                   </Badge>
//                 </div>
//                 <div className="border-t pt-4">
//                   <div className="flex items-center justify-between">
//                     <span className="font-medium">Amount Due</span>
//                     <span className="text-lg font-bold text-primary">
//                       {formatCurrency(totalPendingAmount)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Activity Chart */}
//       {violations.length > 0 && (
//         <ActivityChart data={chartData} title="Your Activity (Last 7 Days)" />
//       )}
//     </div>
//   );
// }

// src/app/dashboard/citizen/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  IndianRupee, 
  CheckCircle2, 
  Clock,
  CreditCard,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { PaymentDialog } from '@/components/payments/payment-dialog';
import { PaymentCard } from '@/components/payments/payment-card';

export default function CitizenDashboard() {
  const { data: session } = useSession();
  const [violations, setViolations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch violations
      const violationsRes = await fetch('/api/violations');
      const violationsData = await violationsRes.json();
      if (violationsData.success) {
        setViolations(violationsData.data || []);
      }

      // Fetch payments
      const paymentsRes = await fetch('/api/payments');
      const paymentsData = await paymentsRes.json();
      if (paymentsData.success) {
        setPayments(paymentsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (violation: any) => {
    setSelectedViolation(violation);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchData(); // Refresh data after payment
  };

  // Calculate statistics
  const pendingViolations = violations.filter(v => v.payment_status === 'PENDING');
  const paidViolations = violations.filter(v => v.payment_status === 'PAID');
  const totalPending = pendingViolations.reduce((sum, v) => sum + (v.total_fine || 0), 0);
  const totalPaid = paidViolations.reduce((sum, v) => sum + (v.total_fine || 0), 0);

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
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session?.user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your traffic violations and payments
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{violations.length}</span>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-red-600">
                {pendingViolations.length}
              </span>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {formatCurrency(totalPending)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Paid Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-600">
                {paidViolations.length}
              </span>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {formatCurrency(totalPaid)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Fines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">
                {formatCurrency(totalPending + totalPaid)}
              </span>
              <IndianRupee className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments Alert */}
      {pendingViolations.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have {pendingViolations.length} pending violation{pendingViolations.length > 1 ? 's' : ''} 
            with a total amount of <strong>{formatCurrency(totalPending)}</strong>. 
            Please settle your payments to avoid further penalties.
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Violations */}
      {pendingViolations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-red-500" />
                  Pending Violations
                </CardTitle>
                <CardDescription className="mt-1">
                  Pay your violations to clear your record
                </CardDescription>
              </div>
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {pendingViolations.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingViolations.map((violation) => (
                <Card key={violation.id} className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {violation.violation_id}
                          </h3>
                          <Badge variant="destructive">Pending</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-gray-600">License Plate</p>
                            <p className="font-medium">{violation.vehicle.license_plate}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Date</p>
                            <p className="font-medium">{formatDate(violation.timestamp)}</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-gray-600 text-sm mb-1">Violations:</p>
                          <div className="space-y-1">
                            {violation.violations.map((v: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-700">{v.description}</span>
                                <span className="font-medium">
                                  {formatCurrency(v.fine_amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-red-200">
                          <div>
                            <p className="text-sm text-gray-600">Total Fine</p>
                            <p className="text-2xl font-bold text-red-600">
                              {formatCurrency(violation.total_fine)}
                            </p>
                          </div>
                          <Button 
                            onClick={() => handlePayNow(violation)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Payments */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Recent Payments
                </CardTitle>
                <CardDescription className="mt-1">
                  Your payment history
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payments.slice(0, 4).map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paid Violations */}
      {paidViolations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Paid Violations
            </CardTitle>
            <CardDescription className="mt-1">
              Violations you've already settled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paidViolations.map((violation) => (
                <div 
                  key={violation.id} 
                  className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{violation.violation_id}</p>
                      <p className="text-sm text-gray-600">
                        {violation.vehicle.license_plate} • {formatDate(violation.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500 mb-1">Paid</Badge>
                    <p className="font-bold text-green-600">
                      {formatCurrency(violation.total_fine)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Violations */}
      {violations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Violations Found</h3>
            <p className="text-gray-600">
              You have a clean driving record. Keep up the good work!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      {selectedViolation && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          violation={selectedViolation}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}