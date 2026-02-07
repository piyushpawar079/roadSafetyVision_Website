// ===========================================
// AUTH ERROR PAGE
// ===========================================

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have access to this resource.',
  Verification: 'The verification link has expired or has already been used.',
  OAuthSignin: 'Error occurred while signing in with the provider.',
  OAuthCallback: 'Error occurred during the OAuth callback.',
  OAuthCreateAccount: 'Could not create user account.',
  EmailCreateAccount: 'Could not create user account with this email.',
  Callback: 'Error occurred during the callback.',
  OAuthAccountNotLinked: 'This email is already associated with another account.',
  EmailSignin: 'Error sending the verification email.',
  CredentialsSignin: 'Invalid email or password.',
  SessionRequired: 'Please sign in to access this page.',
  Default: 'An unexpected error occurred.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold">Authentication Error</h1>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
              <p className="text-red-800">{errorMessage}</p>
            </div>

            {error && (
              <p className="text-xs text-center text-muted-foreground">
                Error code: {error}
              </p>
            )}

            <div className="grid gap-3">
              <Link href="/auth/login">
                <Button className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </Link>

              <Link href="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}