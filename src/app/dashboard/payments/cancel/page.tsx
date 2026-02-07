// ===========================================
// PAYMENT CANCELLED PAGE
// ===========================================

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center text-white">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <XCircle className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-bold">Payment Cancelled</h1>
            <p className="mt-2 opacity-90">
              Your payment was not completed
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t worry, no charges were made to your account.
              </p>
            </div>

            <div className="grid gap-3">
              <Link href="/dashboard/payments">
                <Button className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </Link>

              <Link href="/dashboard/citizen">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-center text-muted-foreground">
                If you&apos;re experiencing issues, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}