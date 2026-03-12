// ===========================================
// VIOLATION CARD COMPONENT
// ===========================================

'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  formatCurrency,
  formatDate,
  formatTime,
  getViolationTypeColor,
  getPlateStatusColor,
  getPaymentStatusColor,
} from '@/lib/utils';
import { Violation } from '@/types';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Eye,
  Car,
} from 'lucide-react';

interface ViolationCardProps {
  violation: Violation;
  showPayButton?: boolean;
  showViewButton?: boolean;
}

export function ViolationCard({
  violation,
  showPayButton = false,
  showViewButton = true,
}: ViolationCardProps) {
  // Use document ID if available, fallback to violation_id
  const linkId = violation.violation_id || violation.violation_id;
  
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono font-semibold">
                {violation.vehicle?.license_plate || 'UNKNOWN'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {violation.violation_id?.slice(0, 20) || 'N/A'}...
            </p>
          </div>
          <Badge
            variant="outline"
            className={getPaymentStatusColor(violation.payment_status)}
          >
            {violation.payment_status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Violation Types */}
        <div className="flex flex-wrap gap-1">
          {violation.violations?.map((v, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`text-xs ${getViolationTypeColor(v.type)}`}
            >
              {v.type.replace('_', ' ')}
            </Badge>
          ))}
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(violation.date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(violation.time)}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{violation.location?.junction_name || 'Unknown Location'}</span>
        </div>

        {/* Plate Status */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-xs ${getPlateStatusColor(violation.vehicle?.plate_status || 'UNKNOWN')}`}
          >
            {(violation.vehicle?.plate_status || 'UNKNOWN').replace('_', ' ')}
          </Badge>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(violation.total_fine || 0)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-t bg-muted/30 px-4 py-3">
        {showViewButton && (
          <Link href={`/dashboard/violations/${linkId}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
        )}
        {showPayButton && violation.payment_status === 'PENDING' && (
          <Link href={`/dashboard/payments?violation=${linkId}`} className="flex-1">
            <Button className="w-full" size="sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}