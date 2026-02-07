// ===========================================
// ADMIN REQUESTS PAGE (Super Admin Only)
// ===========================================

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { AdminRequestCard } from '@/components/admin/admin-request-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AdminRequest } from '@/types';
import { UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AdminRequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    fetchRequests();
  }, [session, router]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin-requests');
      const result = await response.json();
      if (result.success) {
        setRequests(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const approvedRequests = requests.filter((r) => r.status === 'approved');
  const rejectedRequests = requests.filter((r) => r.status === 'rejected');

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Access Requests"
        description="Review and manage admin access requests from users"
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingRequests.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No pending requests"
              description="There are no admin access requests waiting for review."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingRequests.map((request) => (
                <AdminRequestCard
                  key={request.id}
                  request={request}
                  onUpdate={fetchRequests}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedRequests.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No approved requests"
              description="No admin access requests have been approved yet."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {approvedRequests.map((request) => (
                <AdminRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedRequests.length === 0 ? (
            <EmptyState
              icon={XCircle}
              title="No rejected requests"
              description="No admin access requests have been rejected."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rejectedRequests.map((request) => (
                <AdminRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}