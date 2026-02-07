// ===========================================
// SINGLE ADMIN REQUEST API
// PATCH - Approve/Reject admin request (super admin only)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase-admin';
import { sendAdminRequestStatusEmail } from '@/services/email.service';
import { AdminRequest, ApiResponse } from '@/types';
import { getCurrentTimestamp } from '@/utils/helpers';

// PATCH - Approve or reject admin request
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Only super admin can process admin requests
    if (session.user.role !== 'super_admin') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Access denied. Super admin privileges required.',
        },
        { status: 403 }
      );
    }

     const { id: requestId } = await context.params;
    const body = await request.json();
    console.log(requestId, body);
    const { action } = body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid action. Must be "approve" or "reject"',
        },
        { status: 400 }
      );
    }

    // Get the request
    const requestRef = await adminDb.collection('admin_requests').doc(requestId);
    const requestDoc = await requestRef.get();
    console.log(requestRef)

    if (!requestDoc.exists) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Admin request not found',
        },
        { status: 404 }
      );
    }

    const adminRequest = requestDoc.data() as AdminRequest;

    if (adminRequest.status !== 'pending') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'This request has already been processed',
        },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update request status
    await requestRef.update({
      status: newStatus,
      processed_at: getCurrentTimestamp(),
      processed_by: session.user.id,
    });

    // If approved, update user role
    if (action === 'approve') {
      const usersRef = adminDb.collection('users');
      const userDoc = await usersRef.doc(adminRequest.user_id).get();

      if (userDoc.exists) {
        await usersRef.doc(adminRequest.user_id).update({
          role: 'admin',
          updatedAt: getCurrentTimestamp(),
        });
      }
    }

    // Send email notification to user
    await sendAdminRequestStatusEmail(adminRequest.user_email, adminRequest.user_name, newStatus);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `Admin request ${newStatus} successfully`,
        data: {
          request_id: requestId,
          status: newStatus,
          user_email: adminRequest.user_email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Process admin request error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}