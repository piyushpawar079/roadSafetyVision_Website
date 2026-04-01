// // ===========================================
// // SINGLE VIOLATION DETAIL PAGE
// // src/app/dashboard/violations/[id]/page.tsx
// // ===========================================

// 'use client';

// import { useEffect, useState, use } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import { PageHeader } from '@/components/ui/page-header';
// import { EvidenceViewer } from '@/components/violations/evidence-viewer';
// import { PlateEditor } from '@/components/violations/plate-editor';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import { LoadingSpinner } from '@/components/ui/loading-spinner';
// import {
//   formatCurrency,
//   formatDate,
//   formatTime,
//   getViolationTypeColor,
//   getPlateStatusColor,
//   getPaymentStatusColor,
//   getSeverityColor,
// } from '@/lib/utils';
// import { Violation } from '@/types';
// import {
//   ArrowLeft,
//   Calendar,
//   Clock,
//   MapPin,
//   Car,
//   Users,
//   AlertTriangle,
//   CreditCard,
//   Mail,
//   Phone,
//   Camera,
// } from 'lucide-react';
// import Link from 'next/link';

// // Props type for the page
// interface ViolationDetailPageProps {
//   params: Promise<{ id: string }>;
// }

// export default function ViolationDetailPage({ params }: ViolationDetailPageProps) {
//   // Unwrap the params promise using React.use()
//   const { id: violationId } = use(params);
  
//   const router = useRouter();
//   const { data: session } = useSession();
//   const [violation, setViolation] = useState<Violation | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super_admin';
//   const isCitizen = session?.user?.role === 'citizen';

//   useEffect(() => {
//     if (violationId) {
//       fetchViolation();
//     }
//   }, [violationId]);

//   const fetchViolation = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log('Fetching violation with ID:', violationId);
      
//       const response = await fetch(`/api/violations/${violationId}`);
//       const result = await response.json();
      
//       console.log('API Response:', result);
      
//       if (result.success) {
//         setViolation(result.data);
//       } else {
//         setError(result.message || 'Failed to fetch violation');
//         console.error('Failed to fetch violation:', result.message);
//       }
//     } catch (err) {
//       console.error('Error fetching violation:', err);
//       setError('An error occurred while fetching the violation');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex h-[50vh] items-center justify-center">
//         <LoadingSpinner size="lg" text="Loading violation details..." />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
//         <p className="text-red-500">{error}</p>
//         <Button variant="outline" onClick={() => router.push('/dashboard/violations')}>
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back to Violations
//         </Button>
//       </div>
//     );
//   }

//   if (!violation) {
//     return (
//       <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
//         <p className="text-muted-foreground">Violation not found</p>
//         <Button variant="outline" onClick={() => router.push('/dashboard/violations')}>
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back to Violations
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <Button variant="ghost" size="icon" onClick={() => router.back()}>
//           <ArrowLeft className="h-5 w-5" />
//         </Button>
//         <PageHeader
//           title={`Violation ${violation.violation_id?.slice(0, 15) || violation.violation_id?.slice(0, 8)}...`}
//           description={`Recorded on ${formatDate(violation.date)} at ${formatTime(violation.time)}`}
//         />
//       </div>

//       {/* Status Badges */}
//       <div className="flex flex-wrap gap-2">
//         <Badge variant="outline" className={getPaymentStatusColor(violation.payment_status)}>
//           {violation.payment_status === 'PAID' ? '✓ Paid' : '⏳ Payment Pending'}
//         </Badge>
//         <Badge variant="outline" className={getPlateStatusColor(violation.vehicle?.plate_status || 'UNKNOWN')}>
//           Plate: {(violation.vehicle?.plate_status || 'UNKNOWN').replace('_', ' ')}
//         </Badge>
//         {violation.notification_sent && (
//           <Badge variant="outline" className="bg-blue-50 text-blue-700">
//             ✓ Notification Sent
//           </Badge>
//         )}
//       </div>

//       <div className="grid gap-6 lg:grid-cols-3">
//         {/* Main Content */}
//         <div className="space-y-6 lg:col-span-2">
//           {/* Evidence Images */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Camera className="h-5 w-5" />
//                 Evidence Images
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {violation.evidence ? (
//                 <EvidenceViewer evidence={violation.evidence} />
//               ) : (
//                 <p className="text-muted-foreground">No evidence images available</p>
//               )}
//             </CardContent>
//           </Card>

//           {/* Violation Details */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <AlertTriangle className="h-5 w-5 text-orange-500" />
//                 Violation Details
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {violation.violations?.map((v, index) => (
//                   <div
//                     key={index}
//                     className="flex items-start justify-between rounded-lg border p-4"
//                   >
//                     <div className="space-y-1">
//                       <div className="flex items-center gap-2">
//                         <Badge
//                           variant="outline"
//                           className={getViolationTypeColor(v.type)}
//                         >
//                           {v.type.replace('_', ' ')}
//                         </Badge>
//                         <Badge variant="outline" className={getSeverityColor(v.severity)}>
//                           {v.severity}
//                         </Badge>
//                       </div>
//                       <p className="text-sm text-muted-foreground">
//                         {v.description}
//                       </p>
//                     </div>
//                     <p className="font-semibold text-primary">
//                       {formatCurrency(v.fine_amount)}
//                     </p>
//                   </div>
//                 )) || (
//                   <p className="text-muted-foreground">No violation details available</p>
//                 )}

//                 <Separator />

//                 <div className="flex items-center justify-between text-lg font-semibold">
//                   <span>Total Fine</span>
//                   <span className="text-primary">
//                     {formatCurrency(violation.total_fine || 0)}
//                   </span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Location Details */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <MapPin className="h-5 w-5" />
//                 Location Details
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid gap-4 sm:grid-cols-2">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Junction Name</p>
//                   <p className="font-medium">{violation.location?.junction_name || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Camera ID</p>
//                   <p className="font-mono font-medium">
//                     {violation.location?.camera_id || 'N/A'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Coordinates</p>
//                   <p className="font-mono text-sm">
//                     {violation.location?.coordinates 
//                       ? `${violation.location.coordinates.lat?.toFixed(6)}, ${violation.location.coordinates.lng?.toFixed(6)}`
//                       : 'N/A'
//                     }
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Signal State</p>
//                   <Badge
//                     variant="outline"
//                     className={
//                       violation.signal_state === 'RED'
//                         ? 'bg-red-100 text-red-700'
//                         : 'bg-green-100 text-green-700'
//                     }
//                   >
//                     {violation.signal_state || 'UNKNOWN'}
//                   </Badge>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* Vehicle Information */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <Car className="h-5 w-5" />
//                 Vehicle Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <p className="text-sm text-muted-foreground">License Plate</p>
//                 <div className="mt-1 flex items-center gap-2">
//                   <p className="font-mono text-lg font-bold">
//                     {violation.vehicle?.license_plate || 'UNKNOWN'}
//                   </p>
//                   {isAdmin && violation.violation_id && (
//                     <PlateEditor
//                       violationId={violation.violation_id}
//                       currentPlate={violation.vehicle?.license_plate || ''}
//                       onUpdate={fetchViolation}
//                     />
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <p className="text-sm text-muted-foreground">Plate Status</p>
//                 <Badge
//                   variant="outline"
//                   className={`mt-1 ${getPlateStatusColor(violation.vehicle?.plate_status || 'UNKNOWN')}`}
//                 >
//                   {(violation.vehicle?.plate_status || 'UNKNOWN').replace('_', ' ')}
//                 </Badge>
//               </div>

//               <div>
//                 <p className="text-sm text-muted-foreground">OCR Confidence</p>
//                 <div className="mt-1 flex items-center gap-2">
//                   <div className="h-2 flex-1 rounded-full bg-muted">
//                     <div
//                       className="h-full rounded-full bg-primary"
//                       style={{
//                         width: `${(violation.vehicle?.ocr_confidence || 0) * 100}%`,
//                       }}
//                     />
//                   </div>
//                   <span className="text-sm font-medium">
//                     {Math.round((violation.vehicle?.ocr_confidence || 0) * 100)}%
//                   </span>
//                 </div>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Riders</p>
//                   <div className="mt-1 flex items-center gap-1">
//                     <Users className="h-4 w-4 text-muted-foreground" />
//                     <span className="font-medium">{violation.vehicle?.num_riders || 1}</span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Owner Information (Admin only) */}
//           {isAdmin && violation.citizen_email && (
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Owner Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex items-center gap-2">
//                   <Users className="h-4 w-4 text-muted-foreground" />
//                   <span>{violation.citizen_name || 'Unknown'}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Mail className="h-4 w-4 text-muted-foreground" />
//                   <span className="text-sm">{violation.citizen_email}</span>
//                 </div>
//                 {violation.citizen_phone && (
//                   <div className="flex items-center gap-2">
//                     <Phone className="h-4 w-4 text-muted-foreground" />
//                     <span>{violation.citizen_phone}</span>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           )}

//           {/* Date & Time */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Date & Time</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="flex items-center gap-2">
//                 <Calendar className="h-4 w-4 text-muted-foreground" />
//                 <span>{formatDate(violation.date)}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Clock className="h-4 w-4 text-muted-foreground" />
//                 <span>{formatTime(violation.time)}</span>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Payment Action */}
//           {isCitizen && violation.payment_status === 'PENDING' && (
//             <Card className="border-primary bg-primary/5">
//               <CardContent className="p-6">
//                 <div className="text-center">
//                   <p className="text-sm text-muted-foreground">Amount Due</p>
//                   <p className="text-3xl font-bold text-primary">
//                     {formatCurrency(violation.total_fine || 0)}
//                   </p>
//                 </div>
//                 <Link href={`/dashboard/payments?violation=${violation.violation_id}`}>
//                   <Button className="mt-4 w-full" size="lg">
//                     <CreditCard className="mr-2 h-5 w-5" />
//                     Pay Fine Now
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>
//           )}

//           {/* Paid Status */}
//           {violation.payment_status === 'PAID' && (
//             <Card className="border-green-200 bg-green-50">
//               <CardContent className="p-6 text-center">
//                 <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
//                   <CreditCard className="h-6 w-6 text-green-600" />
//                 </div>
//                 <p className="font-semibold text-green-700">Payment Completed</p>
//                 <p className="text-sm text-green-600">
//                   {formatCurrency(violation.total_fine || 0)}
//                 </p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// src/app/dashboard/violations/[id]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { EvidenceViewer } from '@/components/violations/evidence-viewer';
import { PlateEditor } from '@/components/violations/plate-editor';
import { PaymentDialog } from '@/components/payments/payment-dialog';
import {
  formatCurrency,
  formatDate,
  formatTime,
  getViolationTypeColor,
  getPlateStatusColor,
  getPaymentStatusColor,
  getSeverityColor,
} from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Car,
  AlertTriangle,
  IndianRupee,
  CheckCircle2,
  CreditCard,
  Clock,
  Receipt,
  Camera,
  Users,
  Mail,
  Phone,
  Image as ImageIcon,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ViolationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [violation, setViolation] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const isAdmin =
    session?.user?.role === 'admin' || session?.user?.role === 'super_admin';
  const isCitizen = session?.user?.role === 'citizen';

  useEffect(() => {
    fetchViolation();
  }, [id]);

  const fetchViolation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/violations/${id}`);
      const data = await response.json();

      if (data.success) {
        setViolation(data.data);

        // If violation is paid, fetch payment details
        if (data.data.payment_id) {
          fetchPayment(data.data.payment_id);
        }
      }
    } catch (error) {
      console.error('Error fetching violation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      const data = await response.json();

      if (data.success) {
        setPayment(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
    }
  };

  const handlePaymentSuccess = () => {
    fetchViolation();
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!violation) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Violation not found</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/dashboard/violations')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Violations
        </Button>
      </div>
    );
  }

  const canPayViolation =
    violation.payment_status === 'PENDING' &&
    isCitizen &&
    violation.citizen_email === session?.user?.email;

  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {violation.violation_id?.length > 20
                ? `${violation.violation_id.slice(0, 20)}…`
                : violation.violation_id}
            </h1>
            <p className="text-gray-600 mt-1">
              Recorded on {formatDate(violation.date)} at{' '}
              {formatTime(violation.time)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Payment status */}
          {violation.payment_status === 'PAID' ? (
            <Badge className="bg-green-500 text-base px-4 py-2">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Paid
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-base px-4 py-2">
              <Clock className="mr-2 h-4 w-4" />
              Pending
            </Badge>
          )}

          {/* Plate status */}
          <Badge
            variant="outline"
            className={getPlateStatusColor(
              violation.vehicle?.plate_status || 'UNKNOWN'
            )}
          >
            Plate:{' '}
            {(violation.vehicle?.plate_status || 'UNKNOWN').replace('_', ' ')}
          </Badge>

          {/* Notification sent */}
          {violation.notification_sent && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              ✓ Notification Sent
            </Badge>
          )}
        </div>
      </div>

      {/* ── Payment alert for citizen ── */}
      {canPayViolation && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-red-800">
              This violation requires payment of{' '}
              <strong>{formatCurrency(violation.total_fine)}</strong>
            </span>
            <Button
              onClick={() => setPaymentDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Admin review alert ── */}
      {isAdmin && violation.vehicle?.plate_status === 'MANUAL_REVIEW' && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            This violation requires manual review of the license plate. Please
            verify and update the plate number below.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / main column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Evidence Images — uses EvidenceViewer with processed plate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-500" />
                Evidence Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              {violation.evidence ? (
                <>
                  <EvidenceViewer evidence={violation.evidence} />

                  {/* Processed plate image — shown separately and prominently */}
                  {violation.evidence.plate_processed && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-blue-500" />
                        Processed Plate Image
                      </p>
                      <div className="inline-block border-2 border-blue-300 rounded-lg overflow-hidden shadow-md bg-gray-900 p-2">
                        <img
                          src={violation.evidence.plate_processed}
                          alt="Processed license plate"
                          className="h-20 object-contain rounded"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        OCR confidence:{' '}
                        {Math.round(
                          (violation.vehicle?.ocr_confidence || 0) * 100
                        )}
                        %
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">
                  No evidence images available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Violation details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Violation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date &amp; Time</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="font-medium">
                      {formatTimestamp(violation.timestamp)}
                    </p>
                  </div>
                </div>

                {/* <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <p className="font-medium">
                      {violation.location?.junction_name || 'N/A'}
                    </p>
                  </div>
                </div> */}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Detected Violations
                </p>
                <div className="space-y-2">
                  {violation.violations?.map((v: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getViolationTypeColor(v.type)}
                          >
                            {v.type.replace('_', ' ')}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getSeverityColor(v.severity)}
                          >
                            {v.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {v.description}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">
                        {formatCurrency(v.fine_amount)}
                      </p>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">
                      No violation details available
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-lg">
                      Total Fine Amount
                    </span>
                  </div>
                  <span className="text-3xl font-bold text-blue-600">
                    {formatCurrency(violation.total_fine || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-500" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    License Plate
                  </p>
                  {/* PlateEditor for admins; plain text for everyone else */}
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-mono text-lg font-bold">
                      {violation.vehicle?.license_plate || 'UNKNOWN'}
                    </p>
                    {isAdmin && violation.violation_id && (
                      <PlateEditor
                        violationId={violation.violation_id}
                        currentPlate={violation.vehicle?.license_plate || ''}
                        onUpdate={fetchViolation}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Plate Status</p>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${getPlateStatusColor(
                      violation.vehicle?.plate_status || 'UNKNOWN'
                    )}`}
                  >
                    {(violation.vehicle?.plate_status || 'UNKNOWN').replace(
                      '_',
                      ' '
                    )}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    OCR Confidence
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${
                            (violation.vehicle?.ocr_confidence || 0) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(
                        (violation.vehicle?.ocr_confidence || 0) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Number of Riders
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {violation.vehicle?.num_riders || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner info — visible to admins always, to citizens for their own violations */}
              {(isAdmin || isCitizen) && violation.citizen_email && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-2">
                    Registered Owner
                  </p>
                  <div className="space-y-1">
                    {violation.citizen_name && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {violation.citizen_name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{violation.citizen_email}</span>
                    </div>
                    {violation.citizen_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {violation.citizen_phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Details */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Junction Name
                  </p>
                  <p className="font-medium">
                    {violation.location?.junction_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Camera ID</p>
                  <p className="font-mono font-medium">
                    {violation.location?.camera_id || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p className="font-mono text-sm">
                    {violation.location?.coordinates
                      ? `${violation.location.coordinates.lat?.toFixed(6)}, ${violation.location.coordinates.lng?.toFixed(6)}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Signal State</p>
                  <Badge
                    variant={
                      violation.signal_state === 'RED'
                        ? 'destructive'
                        : 'default'
                    }
                    className="mt-1"
                  >
                    {violation.signal_state || 'UNKNOWN'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">
          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {violation.payment_status === 'PAID' && payment ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-700">
                      Payment Completed
                    </p>
                    <p className="text-sm text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Transaction ID</p>
                      <p className="font-medium font-mono">
                        {payment.transaction_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment ID</p>
                      <p className="font-medium">{payment.payment_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Date</p>
                      <p className="font-medium">
                        {formatTimestamp(payment.payment_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Method</p>
                      <p className="font-medium capitalize">
                        {payment.payment_method?.replace('_', ' ') ||
                          'Demo Payment'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <Clock className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="font-semibold text-red-700">
                      Payment Pending
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Amount Due</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(violation.total_fine || 0)}
                      </p>
                    </div>

                    {canPayViolation && (
                      <Button
                        onClick={() => setPaymentDialogOpen(true)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Camera ID</p>
                <p className="font-medium">
                  {violation.location?.camera_id || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Signal State</p>
                <Badge
                  variant={
                    violation.signal_state === 'RED' ? 'destructive' : 'default'
                  }
                >
                  {violation.signal_state || 'UNKNOWN'}
                </Badge>
              </div>
              <div>
                <p className="text-gray-600">Detection Confidence</p>
                <p className="font-medium">
                  {Math.round(
                    (violation.vehicle?.ocr_confidence || 0) * 100
                  )}
                  %
                </p>
              </div>
              <div>
                <p className="text-gray-600">Notification Sent</p>
                <Badge
                  variant={
                    violation.notification_sent ? 'default' : 'secondary'
                  }
                >
                  {violation.notification_sent ? 'Yes' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        violation={violation}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
