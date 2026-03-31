// // ===========================================
// // VIOLATIONS LIST PAGE
// // ===========================================

// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { useSession } from 'next-auth/react';
// import { useSearchParams } from 'next/navigation';
// import { PageHeader } from '@/components/ui/page-header';
// import { ViolationCard } from '@/components/violations/violation-card';
// import { ViolationFilters, FilterValues } from '@/components/violations/violation-filters';
// import { LoadingSpinner } from '@/components/ui/loading-spinner';
// import { EmptyState } from '@/components/ui/empty-state';
// import { Button } from '@/components/ui/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Violation } from '@/types';
// import { FileWarning, Grid, List } from 'lucide-react';

// export default function ViolationsPage() {
//   const { data: session } = useSession();
//   const searchParams = useSearchParams();
//   const [violations, setViolations] = useState<Violation[]>([]);
//   const [filteredViolations, setFilteredViolations] = useState<Violation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

//   const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super_admin';
//   const isCitizen = session?.user?.role === 'citizen';

//   // Get initial filter from URL
//   const initialPlateStatus = searchParams.get('plate_status');

//   useEffect(() => {
//     fetchViolations();
//   }, []);

//   const fetchViolations = async () => {
//     try {
//       const response = await fetch('/api/violations');
//       const result = await response.json();
//       if (result.success) {
//         const data = result.data || [];
//         setViolations(data);
        
//         // Apply initial filter from URL
//         if (initialPlateStatus) {
//           setFilteredViolations(
//             data.filter((v: Violation) => v.vehicle.plate_status === initialPlateStatus)
//           );
//         } else {
//           setFilteredViolations(data);
//         }
//       }
//     } catch (error) {
//       console.error('Failed to fetch violations:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilterChange = useCallback(
//     (filters: FilterValues) => {
//       let result = [...violations];

//       if (filters.date) {
//         result = result.filter((v) => v.date === filters.date);
//       }

//       if (filters.violationType && filters.violationType !== 'all') {
//         result = result.filter((v) =>
//           v.violations.some((vt) => vt.type === filters.violationType)
//         );
//       }

//       if (filters.paymentStatus && filters.paymentStatus !== 'all') {
//         result = result.filter((v) => v.payment_status === filters.paymentStatus);
//       }

//       if (filters.plateStatus && filters.plateStatus !== 'all') {
//         result = result.filter((v) => v.vehicle.plate_status === filters.plateStatus);
//       }

//       setFilteredViolations(result);
//     },
//     [violations]
//   );

//   if (loading) {
//     return (
//       <div className="flex h-[50vh] items-center justify-center">
//         <LoadingSpinner size="lg" text="Loading violations..." />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         title="Traffic Violations"
//         description={
//           isCitizen
//             ? 'View all your recorded traffic violations'
//             : 'Manage and review all traffic violations'
//         }
//       >
//         <div className="flex items-center gap-2">
//           <Button
//             variant={viewMode === 'grid' ? 'default' : 'outline'}
//             size="icon"
//             onClick={() => setViewMode('grid')}
//           >
//             <Grid className="h-4 w-4" />
//           </Button>
//           <Button
//             variant={viewMode === 'list' ? 'default' : 'outline'}
//             size="icon"
//             onClick={() => setViewMode('list')}
//           >
//             <List className="h-4 w-4" />
//           </Button>
//         </div>
//       </PageHeader>

//       {/* Filters */}
//       <ViolationFilters
//         onFilterChange={handleFilterChange}
//         showPlateStatus={isAdmin}
//       />

//       {/* Tabs for quick filtering */}
//       <Tabs defaultValue="all" className="w-full">
//         <TabsList>
//           <TabsTrigger value="all" onClick={() => setFilteredViolations(violations)}>
//             All ({violations.length})
//           </TabsTrigger>
//           <TabsTrigger
//             value="pending"
//             onClick={() =>
//               setFilteredViolations(
//                 violations.filter((v) => v.payment_status === 'PENDING')
//               )
//             }
//           >
//             Pending ({violations.filter((v) => v.payment_status === 'PENDING').length})
//           </TabsTrigger>
//           <TabsTrigger
//             value="paid"
//             onClick={() =>
//               setFilteredViolations(
//                 violations.filter((v) => v.payment_status === 'PAID')
//               )
//             }
//           >
//             Paid ({violations.filter((v) => v.payment_status === 'PAID').length})
//           </TabsTrigger>
//           {isAdmin && (
//             <TabsTrigger
//               value="review"
//               onClick={() =>
//                 setFilteredViolations(
//                   violations.filter((v) => v.vehicle.plate_status === 'MANUAL_REVIEW')
//                 )
//               }
//             >
//               Needs Review (
//               {violations.filter((v) => v.vehicle.plate_status === 'MANUAL_REVIEW').length})
//             </TabsTrigger>
//           )}
//         </TabsList>
//       </Tabs>

//       {/* Violations Grid/List */}
//       {filteredViolations.length === 0 ? (
//         <EmptyState
//           icon={FileWarning}
//           title="No violations found"
//           description={
//             violations.length === 0
//               ? isCitizen
//                 ? "You don't have any recorded violations. Drive safely!"
//                 : 'No violations have been recorded yet.'
//               : 'No violations match your current filters. Try adjusting the filters.'
//           }
//           action={
//             violations.length > 0
//               ? {
//                   label: 'Clear Filters',
//                   onClick: () => setFilteredViolations(violations),
//                 }
//               : undefined
//           }
//         />
//       ) : (
//         <div
//           className={
//             viewMode === 'grid'
//               ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
//               : 'space-y-4'
//           }
//         >
//           {filteredViolations.map((violation) => (
//             <ViolationCard
//               key={violation.violation_id}
//               violation={violation}
//               showPayButton={isCitizen}
//               showViewButton
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


// src/app/dashboard/violations/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  Search, 
  Calendar,
  MapPin,
  IndianRupee,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye
} from 'lucide-react';
import { PaymentDialog } from '@/components/payments/payment-dialog';

export default function ViolationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [violations, setViolations] = useState<any[]>([]);
  const [filteredViolations, setFilteredViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    fetchViolations();
  }, []);

  useEffect(() => {
    filterViolations();
  }, [violations, searchTerm, paymentFilter]);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/violations');
      const data = await response.json();
      
      if (data.success) {
        setViolations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching violations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterViolations = () => {
    let filtered = [...violations];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.violation_id?.toLowerCase().includes(term) ||
        v.vehicle.license_plate?.toLowerCase().includes(term) ||
        v.citizen_email?.toLowerCase().includes(term)
      );
    }

    // Payment status filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(v => {
        if (paymentFilter === 'pending') return v.payment_status === 'PENDING';
        if (paymentFilter === 'paid') return v.payment_status === 'PAID';
        return true;
      });
    }

    setFilteredViolations(filtered);
  };

  const handlePayNow = (violation: any) => {
    setSelectedViolation(violation);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchViolations();
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="destructive">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = violations.filter(v => v.payment_status === 'PENDING').length;
  const paidCount = violations.filter(v => v.payment_status === 'PAID').length;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Traffic Violations</h1>
          <p className="text-gray-600 mt-1">
            View and manage all violations
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Violations</p>
                <p className="text-3xl font-bold mt-1">{violations.length}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Violations</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{paidCount}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by violation ID, license plate, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Violations List */}
      <div className="space-y-4">
        {filteredViolations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No violations found</p>
            </CardContent>
          </Card>
        ) : (
          filteredViolations.map((violation) => (
            <Card 
              key={violation.violation_id}
              className={`hover:shadow-md transition-shadow ${
                violation.payment_status === 'PENDING' ? 'border-red-200' : 'border-green-200'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{violation.violation_id}</h3>
                      {getPaymentStatusBadge(violation.payment_status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{formatDate(violation.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{violation.location.junction_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold">{formatCurrency(violation.total_fine)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Vehicle Details</p>
                    <p className="font-medium">{violation.vehicle.license_plate}</p>
                    {violation.citizen_name && (
                      <p className="text-sm text-gray-600">{violation.citizen_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Violations</p>
                    <div className="space-y-1">
                      {violation.violations.map((v: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{v.description}</span>
                          <span className="font-medium ml-2">{formatCurrency(v.fine_amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {violation.payment_status === 'PAID' && violation.payment_date && (
                      <p className="text-sm text-green-600">
                        Paid on {formatDate(violation.payment_date)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/dashboard/violations/${violation.violation_id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    
                    {violation.payment_status === 'PENDING' && session?.user?.role === 'citizen' && (
                      <Button
                        onClick={() => handlePayNow(violation)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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