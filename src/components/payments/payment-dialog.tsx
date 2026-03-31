// src/components/payments/payment-dialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violation: any;
  onPaymentSuccess: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  violation,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    // console.log(violation)
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          violation_id: violation.violation_id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Payment failed');
      }

      setSuccess(true);
      
      // Wait 2 seconds to show success message
      setTimeout(() => {
        onPaymentSuccess();
        onOpenChange(false);
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      setIsProcessing(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Confirm Payment
          </DialogTitle>
          <DialogDescription>
            Review the violation details and confirm your payment
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* Violation Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Violation Number</p>
                    <p className="font-medium">{violation.violation_id}</p>
                  </div>
                  <Badge variant="destructive">Pending</Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600">License Plate</p>
                  <p className="font-medium">{violation.vehicle.license_plate}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{formatDate(violation.timestamp)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Violations</p>
                  <div className="space-y-1 mt-1">
                    {violation.violations.map((v: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{v.description}</span>
                        <span className="font-medium">
                          {formatCurrency(v.fine_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total Amount</span>
                    <span className="font-bold text-2xl text-blue-600">
                      {formatCurrency(violation.total_fine)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Demo Payment Mode
                </p>
                <p className="text-sm text-blue-600">
                  This is a demonstration payment system. No actual charges will be made.
                  The payment will be recorded and your violation status will be updated.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="min-w-[120px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {formatCurrency(violation.total_fine)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}