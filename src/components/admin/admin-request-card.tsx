// ===========================================
// ADMIN REQUEST CARD COMPONENT
// ===========================================

'use client';

import { AdminRequest } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, formatDateTime } from '@/lib/utils';
import { Check, X, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { toast } from 'sonner';

interface AdminRequestCardProps {
  request: AdminRequest;
  onUpdate?: () => void;
}

export function AdminRequestCard({ request, onUpdate }: AdminRequestCardProps) {
  const [processing, setProcessing] = useState<'approve' | 'reject' | null>(null);
  const { execute } = useApi();

  const handleAction = async (action: 'approve' | 'reject') => {
    setProcessing(action);

    const result = await execute(`/api/admin-requests/${request.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });

    setProcessing(null);

    if (result?.success) {
      toast.success(
        action === 'approve'
          ? 'Admin access approved successfully'
          : 'Admin request rejected'
      );
      onUpdate?.();
    } else {
      toast.error(result?.message || 'Failed to process request');
    }
  };

  const getStatusBadge = () => {
    switch (request.status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <Check className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <X className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(request.user_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{request.user_name}</h4>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">{request.user_email}</p>
            <p className="text-xs text-muted-foreground">
              Requested on {formatDateTime(request.requested_at)}
            </p>
          </div>
        </div>

        {request.status === 'pending' && (
          <div className="mt-4 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => handleAction('approve')}
              disabled={processing !== null}
            >
              {processing === 'approve' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleAction('reject')}
              disabled={processing !== null}
            >
              {processing === 'reject' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Reject
            </Button>
          </div>
        )}

        {request.processed_at && (
          <p className="mt-4 text-xs text-muted-foreground border-t pt-3">
            Processed on {formatDateTime(request.processed_at)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}