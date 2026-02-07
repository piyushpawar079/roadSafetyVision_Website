// ===========================================
// REQUEST ADMIN ACCESS PAGE (Citizens)
// ===========================================

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  LogOut,
  RefreshCw
} from 'lucide-react';

export default function RequestAdminPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<{
    status: string;
    requested_at: number;
  } | null>(null);

  useEffect(() => {
    // If user is already admin or super_admin, redirect
    if (session?.user?.role === 'admin' || session?.user?.role === 'super_admin') {
      router.push('/dashboard');
      return;
    }
    
    checkExistingRequest();
  }, [session, router]);

  const checkExistingRequest = async () => {
    try {
      // Check if user has any pending or approved request
      const response = await fetch('/api/admin-requests/my-request');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setExistingRequest(result.data);
        }
      }
    } catch (error) {
      console.error('Error checking request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Admin access request submitted successfully!');
        setExistingRequest({
          status: 'pending',
          requested_at: Date.now(),
        });
      } else {
        toast.error(result.message || 'Failed to submit request');
        if (result.message?.includes('already have')) {
          setExistingRequest({ status: 'pending', requested_at: Date.now() });
        }
      }
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOutAndSignIn = async () => {
    await signOut({ callbackUrl: '/auth/login?message=admin_approved' });
  };

  const handleRefreshSession = async () => {
    await update();
    // Check if role has been updated
    if (session?.user?.role === 'admin') {
      toast.success('Your admin access is now active!');
      router.push('/dashboard/admin');
    } else {
      toast.info('Please sign out and sign back in to activate admin access.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Request Admin Access"
        description="Submit a request to become a traffic police admin"
      />

      <div className="max-w-2xl">
        {existingRequest?.status === 'approved' ? (
          // Approved - Show sign out instructions
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Request Approved!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-green-800 font-medium">
                  🎉 Congratulations! Your admin access has been approved.
                </p>
              </div>

              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800">Action Required</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      To activate your admin privileges, you need to sign out and sign back in.
                      This will refresh your session with the new admin role.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSignOutAndSignIn}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out & Sign In as Admin
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleRefreshSession}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Refreshing Session
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                After signing back in, you'll be redirected to the Admin Dashboard automatically.
              </p>
            </CardContent>
          </Card>
        ) : existingRequest?.status === 'pending' ? (
          // Pending
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Request Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <p className="text-yellow-800">
                  Your admin access request is currently being reviewed by the
                  super admin. You will be notified via email once a decision
                  is made.
                </p>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>What happens next?</strong>
                </p>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                  <li>• The super admin will review your request</li>
                  <li>• You'll receive an email when a decision is made</li>
                  <li>• If approved, you'll need to sign out and sign back in</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : existingRequest?.status === 'rejected' ? (
          // Rejected - Can request again
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Request Rejected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-red-800">
                  Your previous request was rejected. You can submit a new
                  request if you believe this was in error.
                </p>
              </div>
              <Button onClick={handleSubmitRequest} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit New Request'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // No request yet
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle>Become a Traffic Admin</CardTitle>
                  <CardDescription>
                    Request elevated privileges to manage violations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-semibold mb-2">Admin Privileges Include:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    View all traffic violations in the system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Correct and verify license plate numbers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Review violation evidence and images
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Monitor payment statuses
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Important</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Admin access is intended for authorized traffic police
                      personnel only. Your request will be reviewed by the super
                      admin. Misuse of admin privileges may result in account
                      suspension.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitRequest}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Submit Admin Access Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}