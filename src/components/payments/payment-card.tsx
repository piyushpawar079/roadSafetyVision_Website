// src/components/payments/payment-card.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Calendar, Receipt } from 'lucide-react';

interface PaymentCardProps {
  payment: any;
  showUserDetails?: boolean;
}

export function PaymentCard({ payment, showUserDetails = false }: PaymentCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">
              {payment.payment_id}
            </CardTitle>
          </div>
          <Badge className="bg-green-500">
            Completed
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Amount */}
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(payment.amount)}
          </p>
        </div>

        {/* Payment Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Transaction ID:</span>
            <span className="font-medium text-gray-900 ml-auto">
              {payment.transaction_id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Payment Date:</span>
            <span className="font-medium text-gray-900 ml-auto">
              {formatDate(payment.payment_date)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">Method:</span>
            <span className="font-medium text-gray-900 ml-auto">
              Demo Payment
            </span>
          </div>
        </div>

        {/* Violation Details */}
        <div className="border-t pt-3 mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Violation Number:</span>
            <span className="font-medium">{payment.violation_number}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">License Plate:</span>
            <span className="font-medium">{payment.license_plate}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Violation Type:</span>
            <span className="font-medium text-right ml-2">{payment.violation_type}</span>
          </div>
        </div>

        {/* User Details (for admin view) */}
        {showUserDetails && (
          <div className="border-t pt-3 mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Paid By:</span>
              <span className="font-medium">{payment.user_name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{payment.user_email}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}