// ===========================================
// VIOLATIONS API ROUTES
// GET /api/violations - List violations
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase-admin';
import { ApiResponse, Violation } from '@/types';

// GET - List violations (for dashboard)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const plateStatus = searchParams.get('plate_status');
    const paymentStatus = searchParams.get('payment_status');

    const violationsRef = adminDb.collection('violations');
    let query: FirebaseFirestore.Query = violationsRef;

    // Role-based filtering
    if (session.user.role === 'citizen') {
      query = query.where('citizen_email', '==', session.user.email);
    }

    // Apply filters
    if (plateStatus && plateStatus !== 'all') {
      query = query.where('vehicle.plate_status', '==', plateStatus);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      query = query.where('payment_status', '==', paymentStatus);
    }

    // Order by timestamp descending
    query = query.orderBy('timestamp', 'desc').limit(limit);

    const snapshot = await query.get();
    const violations: Violation[] = [];

    snapshot.forEach((doc) => {
      // IMPORTANT: Include the document ID
      violations.push({
        id: doc.id,  // Firebase document ID
        ...doc.data(),
      } as Violation);
    });

    return NextResponse.json<ApiResponse<Violation[]>>({
      success: true,
      message: 'Violations retrieved successfully',
      data: violations,
    });
  } catch (error) {
    console.error('Get violations error:', error);
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

// POST endpoint remains the same...