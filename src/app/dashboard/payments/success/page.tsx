// ===========================================
// PAYMENT SUCCESS PAGE
// ===========================================

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { CheckCircle, ArrowRight, Download, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center text-white">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="mt-2 opacity-90">
              Your fine has been paid successfully
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-sm font-medium">
                {sessionId?.slice(0, 20)}...
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                A receipt has been sent to your registered email address.
              </p>

              <div className="grid gap-3">
                <Link href="/dashboard/citizen">
                  <Button className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </Link>

                <Link href="/dashboard/violations">
                  <Button variant="outline" className="w-full">
                    View Violations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-center text-muted-foreground">
                Thank you for your payment. Drive safely!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}