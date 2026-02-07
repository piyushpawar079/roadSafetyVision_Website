// ===========================================
// GET USER'S OWN ADMIN REQUEST
// GET /api/admin-requests/my-request
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase-admin';
import { ApiResponse, AdminRequest } from '@/types';

export async function GET(request: NextRequest) {
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

    // Find user's most recent admin request
    const requestsRef = adminDb.collection('admin_requests');
    const snapshot = await requestsRef
      .where('user_email', '==', session.user.email)
      .orderBy('requested_at', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          message: 'No admin request found',
          data: null,
        },
        { status: 200 }
      );
    }

    const request = snapshot.docs[0].data() as AdminRequest;

    return NextResponse.json<ApiResponse<AdminRequest>>(
      {
        success: true,
        message: 'Admin request found',
        data: request,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get my admin request error:', error);
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