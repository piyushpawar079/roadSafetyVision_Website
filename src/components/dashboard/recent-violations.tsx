// ===========================================
// RECENT VIOLATIONS LIST COMPONENT
// ===========================================

'use client';

import { Violation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  formatCurrency,
  formatDate,
  getViolationTypeColor,
  getPaymentStatusColor,
} from '@/lib/utils';
import { ArrowRight, FileWarning } from 'lucide-react';
import Link from 'next/link';

interface RecentViolationsProps {
  violations: Violation[];
  title?: string;
  viewAllHref?: string;
}

export function RecentViolations({
  violations,
  title = 'Recent Violations',
  viewAllHref = '/dashboard/violations',
}: RecentViolationsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileWarning className="h-5 w-5 text-orange-500" />
          {title}
        </CardTitle>
        <Link href={viewAllHref}>
          <Button variant="ghost" size="sm">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {violations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3">
                <FileWarning className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                No violations found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {violations.map((violation) => (
                <Link
                  key={violation.violation_id}
                  href={`/dashboard/violations/${violation.violation_id}`}
                  className="block"
                >
                  <div className="group rounded-lg border p-4 transition-all hover:border-primary hover:bg-muted/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">
                            {violation.violation_id.slice(0, 12)}...
                          </span>
                          <Badge
                            variant="outline"
                            className={getPaymentStatusColor(
                              violation.payment_status
                            )}
                          >
                            {violation.payment_status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {violation.violations.slice(0, 2).map((v, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={`text-xs ${getViolationTypeColor(v.type)}`}
                            >
                              {v.type.replace('_', ' ')}
                            </Badge>
                          ))}
                          {violation.violations.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{violation.violations.length - 2} more
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(violation.date)} •{' '}
                          {violation.location.junction_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatCurrency(violation.total_fine)}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {violation.vehicle.license_plate}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}