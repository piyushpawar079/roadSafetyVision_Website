// ===========================================
// SINGLE VIOLATION DETAIL PAGE
// src/app/dashboard/violations/[id]/page.tsx
// ===========================================

'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/ui/page-header';
import { EvidenceViewer } from '@/components/violations/evidence-viewer';
import { PlateEditor } from '@/components/violations/plate-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  formatCurrency,
  formatDate,
  formatTime,
  getViolationTypeColor,
  getPlateStatusColor,
  getPaymentStatusColor,
  getSeverityColor,
} from '@/lib/utils';
import { Violation } from '@/types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Car,
  Users,
  AlertTriangle,
  CreditCard,
  Mail,
  Phone,
  Camera,
} from 'lucide-react';
import Link from 'next/link';

// Props type for the page
interface ViolationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ViolationDetailPage({ params }: ViolationDetailPageProps) {
  // Unwrap the params promise using React.use()
  const { id: violationId } = use(params);
  
  const router = useRouter();
  const { data: session } = useSession();
  const [violation, setViolation] = useState<Violation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'super_admin';
  const isCitizen = session?.user?.role === 'citizen';

  useEffect(() => {
    if (violationId) {
      fetchViolation();
    }
  }, [violationId]);

  const fetchViolation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching violation with ID:', violationId);
      
      const response = await fetch(`/api/violations/${violationId}`);
      const result = await response.json();
      
      console.log('API Response:', result);
      
      if (result.success) {
        setViolation(result.data);
      } else {
        setError(result.message || 'Failed to fetch violation');
        console.error('Failed to fetch violation:', result.message);
      }
    } catch (err) {
      console.error('Error fetching violation:', err);
      setError('An error occurred while fetching the violation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading violation details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/violations')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Violations
        </Button>
      </div>
    );
  }

  if (!violation) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Violation not found</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/violations')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Violations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={`Violation ${violation.violation_id?.slice(0, 15) || violation.violation_id?.slice(0, 8)}...`}
          description={`Recorded on ${formatDate(violation.date)} at ${formatTime(violation.time)}`}
        />
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className={getPaymentStatusColor(violation.payment_status)}>
          {violation.payment_status === 'PAID' ? '✓ Paid' : '⏳ Payment Pending'}
        </Badge>
        <Badge variant="outline" className={getPlateStatusColor(violation.vehicle?.plate_status || 'UNKNOWN')}>
          Plate: {(violation.vehicle?.plate_status || 'UNKNOWN').replace('_', ' ')}
        </Badge>
        {violation.notification_sent && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            ✓ Notification Sent
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Evidence Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Evidence Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              {violation.evidence ? (
                <EvidenceViewer evidence={violation.evidence} />
              ) : (
                <p className="text-muted-foreground">No evidence images available</p>
              )}
            </CardContent>
          </Card>

          {/* Violation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Violation Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violation.violations?.map((v, index) => (
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
                        <Badge variant="outline" className={getSeverityColor(v.severity)}>
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
                  <p className="text-muted-foreground">No violation details available</p>
                )}

                <Separator />

                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total Fine</span>
                  <span className="text-primary">
                    {formatCurrency(violation.total_fine || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Junction Name</p>
                  <p className="font-medium">{violation.location?.junction_name || 'N/A'}</p>
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
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Signal State</p>
                  <Badge
                    variant="outline"
                    className={
                      violation.signal_state === 'RED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }
                  >
                    {violation.signal_state || 'UNKNOWN'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">License Plate</p>
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
                  className={`mt-1 ${getPlateStatusColor(violation.vehicle?.plate_status || 'UNKNOWN')}`}
                >
                  {(violation.vehicle?.plate_status || 'UNKNOWN').replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">OCR Confidence</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(violation.vehicle?.ocr_confidence || 0) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round((violation.vehicle?.ocr_confidence || 0) * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Riders</p>
                  <div className="mt-1 flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{violation.vehicle?.num_riders || 1}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Information (Admin only) */}
          {isAdmin && violation.citizen_email && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Owner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{violation.citizen_name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{violation.citizen_email}</span>
                </div>
                {violation.citizen_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{violation.citizen_phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(violation.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(violation.time)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Action */}
          {isCitizen && violation.payment_status === 'PENDING' && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(violation.total_fine || 0)}
                  </p>
                </div>
                <Link href={`/dashboard/payments?violation=${violation.violation_id}`}>
                  <Button className="mt-4 w-full" size="lg">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay Fine Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Paid Status */}
          {violation.payment_status === 'PAID' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-semibold text-green-700">Payment Completed</p>
                <p className="text-sm text-green-600">
                  {formatCurrency(violation.total_fine || 0)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}