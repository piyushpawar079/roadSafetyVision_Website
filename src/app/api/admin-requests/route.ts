// ===========================================
// ADMIN REQUESTS API
// GET - List admin requests (super admin only)
// POST - Create admin request (citizens)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase-admin';
import { AdminRequest, ApiResponse } from '@/types';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';

// GET - List admin requests (super admin only)
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

    // Only super admin can view admin requests
    if (session.user.role !== 'super_admin') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Access denied. Super admin privileges required.',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, approved, rejected

    const requestsRef = adminDb.collection('admin_requests');
    let query: FirebaseFirestore.Query = requestsRef.orderBy('requested_at', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();

    const requests = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as AdminRequest[];

    return NextResponse.json<ApiResponse<AdminRequest[]>>(
      {
        success: true,
        message: 'Admin requests retrieved successfully',
        data: requests,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin requests error:', error);
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

// POST - Create admin request
export async function POST(request: NextRequest) {
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

    // Only citizens can request admin access
    if (session.user.role !== 'citizen') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Only citizens can request admin access',
        },
        { status: 400 }
      );
    }

    // Check for existing pending request
    const requestsRef = adminDb.collection('admin_requests');
    const existingRequest = await requestsRef
      .where('user_id', '==', session.user.id)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!existingRequest.empty) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'You already have a pending admin request',
        },
        { status: 409 }
      );
    }

    // Create new request
    const requestId = generateId();
    const newRequest: AdminRequest = {
      id: requestId,
      user_id: session.user.id,
      user_email: session.user.email,
      user_name: session.user.name,
      status: 'pending',
      requested_at: getCurrentTimestamp(),
    };

    await requestsRef.doc(requestId).set(newRequest);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Admin access request submitted successfully',
        data: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create admin request error:', error);
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