// // ===========================================
// // PAYMENTS PAGE (Citizen)
// // ===========================================

// 'use client';

// import { useEffect, useState } from 'react';
// import { useSession } from 'next-auth/react';
// import { PageHeader } from '@/components/ui/page-header';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { LoadingSpinner } from '@/components/ui/loading-spinner';
// import { EmptyState } from '@/components/ui/empty-state';
// import {
//   formatCurrency,
//   formatDate,
//   getViolationTypeColor,
// } from '@/lib/utils';
// import { Violation } from '@/types';
// import { toast } from 'sonner';
// import {
//   CreditCard,
//   FileWarning,
//   CheckCircle,
//   Clock,
//   Loader2,
//   ShoppingCart,
// } from 'lucide-react';
// import Link from 'next/link';

// export default function PaymentsPage() {
//   const { data: session } = useSession();
//   const [violations, setViolations] = useState<Violation[]>([]);
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);

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

//   const selectedViolations = pendingViolations.filter((v) =>
//     selectedIds.includes(v.violation_id)
//   );
//   const totalSelected = selectedViolations.reduce(
//     (sum, v) => sum + v.total_fine,
//     0
//   );

//   const handleSelectAll = () => {
//     if (selectedIds.length === pendingViolations.length) {
//       setSelectedIds([]);
//     } else {
//       setSelectedIds(pendingViolations.map((v) => v.violation_id));
//     }
//   };

//   const handleSelect = (id: string) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
//     );
//   };

//   const handlePayment = async () => {
//     if (selectedIds.length === 0) {
//       toast.error('Please select at least one violation to pay');
//       return;
//     }

//     setProcessing(true);

//     try {
//       const response = await fetch('/api/payments/create-session', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ violation_ids: selectedIds }),
//       });

//       const result = await response.json();

//       if (result.success && result.data?.checkout_url) {
//         window.location.href = result.data.checkout_url;
//       } else {
//         toast.error(result.message || 'Failed to create payment session');
//       }
//     } catch (error) {
//       toast.error('Payment processing failed');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex h-[50vh] items-center justify-center">
//         <LoadingSpinner size="lg" text="Loading payments..." />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="Payments"
//         description="Manage and pay your traffic violation fines"
//       />

//       {/* Summary Cards */}
//       <div className="grid gap-4 sm:grid-cols-3">
//         <Card>
//           <CardContent className="flex items-center gap-4 p-6">
//             <div className="rounded-lg bg-yellow-100 p-3">
//               <Clock className="h-6 w-6 text-yellow-600" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Pending</p>
//               <p className="text-2xl font-bold">{pendingViolations.length}</p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="flex items-center gap-4 p-6">
//             <div className="rounded-lg bg-green-100 p-3">
//               <CheckCircle className="h-6 w-6 text-green-600" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Paid</p>
//               <p className="text-2xl font-bold">{paidViolations.length}</p>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="flex items-center gap-4 p-6">
//             <div className="rounded-lg bg-red-100 p-3">
//               <CreditCard className="h-6 w-6 text-red-600" />
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Total Due</p>
//               <p className="text-2xl font-bold">
//                 {formatCurrency(
//                   pendingViolations.reduce((sum, v) => sum + v.total_fine, 0)
//                 )}
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Pending Violations */}
//         <div className="lg:col-span-2">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <CardTitle className="flex items-center gap-2">
//                 <Clock className="h-5 w-5 text-yellow-500" />
//                 Pending Payments
//               </CardTitle>
//               {pendingViolations.length > 0 && (
//                 <Button variant="outline" size="sm" onClick={handleSelectAll}>
//                   {selectedIds.length === pendingViolations.length
//                     ? 'Deselect All'
//                     : 'Select All'}
//                 </Button>
//               )}
//             </CardHeader>
//             <CardContent>
//               {pendingViolations.length === 0 ? (
//                 <EmptyState
//                   icon={CheckCircle}
//                   title="All caught up!"
//                   description="You don't have any pending fines. Great job!"
//                 />
//               ) : (
//                 <div className="space-y-3">
//                   {pendingViolations.map((violation) => (
//                     <div
//                       key={violation.violation_id}
//                       className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
//                         selectedIds.includes(violation.violation_id)
//                           ? 'border-primary bg-primary/5'
//                           : 'hover:border-muted-foreground/30'
//                       }`}
//                     >
//                       <Checkbox
//                         checked={selectedIds.includes(violation.violation_id)}
//                         onCheckedChange={() => handleSelect(violation.violation_id)}
//                       />
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2">
//                           <span className="font-mono text-sm font-medium">
//                             {violation.violation_id.slice(0, 12)}...
//                           </span>
//                           <span className="text-xs text-muted-foreground">
//                             {formatDate(violation.date)}
//                           </span>
//                         </div>
//                         <div className="mt-1 flex flex-wrap gap-1">
//                           {violation.violations.map((v, i) => (
//                             <Badge
//                               key={i}
//                               variant="outline"
//                               className={`text-xs ${getViolationTypeColor(v.type)}`}
//                             >
//                               {v.type.replace('_', ' ')}
//                             </Badge>
//                           ))}
//                         </div>
//                         <p className="mt-1 text-xs text-muted-foreground">
//                           {violation.location.junction_name}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-semibold text-primary">
//                           {formatCurrency(violation.total_fine)}
//                         </p>
//                         <Link href={`/dashboard/violations/${violation.violation_id}`}>
//                           <Button variant="ghost" size="sm" className="mt-1">
//                             View
//                           </Button>
//                         </Link>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Payment Summary Sidebar */}
//         <div className="space-y-6">
//           {/* Cart Summary */}
//           <Card className="sticky top-6">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <ShoppingCart className="h-5 w-5" />
//                 Payment Summary
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {selectedIds.length === 0 ? (
//                 <p className="text-sm text-muted-foreground text-center py-4">
//                   Select violations to pay
//                 </p>
//               ) : (
//                 <>
//                   <div className="space-y-2">
//                     {selectedViolations.map((v) => (
//                       <div
//                         key={v.violation_id}
//                         className="flex items-center justify-between text-sm"
//                       >
//                         <span className="truncate">
//                           {v.violation_id.slice(0, 8)}...
//                         </span>
//                         <span>{formatCurrency(v.total_fine)}</span>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="border-t pt-4">
//                     <div className="flex items-center justify-between font-semibold">
//                       <span>Total</span>
//                       <span className="text-xl text-primary">
//                         {formatCurrency(totalSelected)}
//                       </span>
//                     </div>
//                   </div>

//                   <Button
//                     className="w-full"
//                     size="lg"
//                     onClick={handlePayment}
//                     disabled={processing}
//                   >
//                     {processing ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Processing...
//                       </>
//                     ) : (
//                       <>
//                         <CreditCard className="mr-2 h-4 w-4" />
//                         Pay {formatCurrency(totalSelected)}
//                       </>
//                     )}
//                   </Button>

//                   <p className="text-xs text-center text-muted-foreground">
//                     Secure payment powered by Stripe
//                   </p>
//                 </>
//               )}
//             </CardContent>
//           </Card>

//           {/* Payment History Link */}
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="rounded-lg bg-green-100 p-2">
//                   <CheckCircle className="h-5 w-5 text-green-600" />
//                 </div>
//                 <div>
//                   <h4 className="font-semibold">Payment History</h4>
//                   <p className="text-sm text-muted-foreground">
//                     {paidViolations.length} paid violations
//                   </p>
//                 </div>
//               </div>
//               <Link href="/dashboard/payments/history">
//                 <Button variant="outline" size="sm" className="w-full">
//                   View History
//                 </Button>
//               </Link>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/app/dashboard/payments/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  CreditCard,
  IndianRupee,
  TrendingUp,
  Download
} from 'lucide-react';
import { PaymentCard } from '@/components/payments/payment-card';
import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total_payments: 0,
    total_amount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments?limit=100');
      const data = await response.json();

      if (data.success) {
        setPayments(data.data || []);
        setStats(data.meta?.stats || { total_payments: 0, total_amount: 0 });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.payment_id?.toLowerCase().includes(term) ||
        p.transaction_id?.toLowerCase().includes(term) ||
        p.violation_number?.toLowerCase().includes(term) ||
        p.license_plate?.toLowerCase().includes(term) ||
        p.user_email?.toLowerCase().includes(term)
      );
    }

    setFilteredPayments(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super_admin';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-1">
            View all payment transactions
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold mt-1">{stats.total_payments}</p>
              </div>
              <CreditCard className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold mt-1 text-green-600">
                  {formatCurrency(stats.total_amount)}
                </p>
              </div>
              <IndianRupee className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Payment</p>
                <p className="text-3xl font-bold mt-1 text-purple-600">
                  {formatCurrency(
                    stats.total_payments > 0 ? stats.total_amount / stats.total_payments : 0
                  )}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by payment ID, transaction ID, violation number, or license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Payments</CardTitle>
              <CardDescription className="mt-1">
                {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Badge className="bg-green-500 text-lg px-4 py-2">
              {filteredPayments.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payments found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPayments.map((payment) => (
                <PaymentCard 
                  key={payment.id} 
                  payment={payment}
                  showUserDetails={isAdmin}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}