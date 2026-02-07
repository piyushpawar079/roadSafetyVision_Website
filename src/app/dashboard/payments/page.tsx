// ===========================================
// PAYMENTS PAGE (Citizen)
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import {
  formatCurrency,
  formatDate,
  getViolationTypeColor,
} from '@/lib/utils';
import { Violation } from '@/types';
import { toast } from 'sonner';
import {
  CreditCard,
  FileWarning,
  CheckCircle,
  Clock,
  Loader2,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';

export default function PaymentsPage() {
  const { data: session } = useSession();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  const pendingViolations = violations.filter(
    (v) => v.payment_status === 'PENDING'
  );
  const paidViolations = violations.filter((v) => v.payment_status === 'PAID');

  const selectedViolations = pendingViolations.filter((v) =>
    selectedIds.includes(v.violation_id)
  );
  const totalSelected = selectedViolations.reduce(
    (sum, v) => sum + v.total_fine,
    0
  );

  const handleSelectAll = () => {
    if (selectedIds.length === pendingViolations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingViolations.map((v) => v.violation_id));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePayment = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one violation to pay');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ violation_ids: selectedIds }),
      });

      const result = await response.json();

      if (result.success && result.data?.checkout_url) {
        window.location.href = result.data.checkout_url;
      } else {
        toast.error(result.message || 'Failed to create payment session');
      }
    } catch (error) {
      toast.error('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading payments..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Manage and pay your traffic violation fines"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingViolations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold">{paidViolations.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-red-100 p-3">
              <CreditCard className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Due</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  pendingViolations.reduce((sum, v) => sum + v.total_fine, 0)
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Violations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Pending Payments
              </CardTitle>
              {pendingViolations.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedIds.length === pendingViolations.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {pendingViolations.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="All caught up!"
                  description="You don't have any pending fines. Great job!"
                />
              ) : (
                <div className="space-y-3">
                  {pendingViolations.map((violation) => (
                    <div
                      key={violation.violation_id}
                      className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                        selectedIds.includes(violation.violation_id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/30'
                      }`}
                    >
                      <Checkbox
                        checked={selectedIds.includes(violation.violation_id)}
                        onCheckedChange={() => handleSelect(violation.violation_id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">
                            {violation.violation_id.slice(0, 12)}...
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(violation.date)}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {violation.violations.map((v, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={`text-xs ${getViolationTypeColor(v.type)}`}
                            >
                              {v.type.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {violation.location.junction_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatCurrency(violation.total_fine)}
                        </p>
                        <Link href={`/dashboard/violations/${violation.violation_id}`}>
                          <Button variant="ghost" size="sm" className="mt-1">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="space-y-6">
          {/* Cart Summary */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedIds.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select violations to pay
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {selectedViolations.map((v) => (
                      <div
                        key={v.violation_id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">
                          {v.violation_id.slice(0, 8)}...
                        </span>
                        <span>{formatCurrency(v.total_fine)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-xl text-primary">
                        {formatCurrency(totalSelected)}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay {formatCurrency(totalSelected)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment powered by Stripe
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment History Link */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Payment History</h4>
                  <p className="text-sm text-muted-foreground">
                    {paidViolations.length} paid violations
                  </p>
                </div>
              </div>
              <Link href="/dashboard/payments/history">
                <Button variant="outline" size="sm" className="w-full">
                  View History
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}