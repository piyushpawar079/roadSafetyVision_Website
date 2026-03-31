// ===========================================
// VIOLATIONS API ROUTES
// GET /api/violations - List violations (for dashboard)
// POST /api/violations - Legacy create (redirects to upload)
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const plateStatus = searchParams.get('plate_status');
    const paymentStatus = searchParams.get('payment_status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let violations: Violation[] = [];

    try {
      // Try the optimized query with index first
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
      query = query.orderBy('timestamp', 'desc');
      query = query.limit(limit);

      const snapshot = await query.get();

      snapshot.forEach((doc) => {
        violations.push({
          doc_id: doc.id,
          ...doc.data(),
        } as Violation);
      });

    } catch (indexError: any) {
      // If index is missing, fall back to simple query + client-side sorting
      console.warn('Index not available, using fallback query:', indexError.message);

      const violationsRef = adminDb.collection('violations');
      let query: FirebaseFirestore.Query = violationsRef;

      // For citizens, use simple query without ordering
      if (session.user.role === 'citizen') {
        query = query.where('citizen_email', '==', session.user.email);
      }

      // Apply only the filters that don't require composite index
      if (paymentStatus && paymentStatus !== 'all') {
        // Skip additional filters for now - apply client-side
      }

      const snapshot = await query.get();
      console.log(snapshot)

      snapshot.forEach((doc) => {
        violations.push({
          violation_id: doc.id,
          ...doc.data(),
        } as Violation);
      });

      // Client-side sorting by timestamp (descending)
      violations.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      // Client-side filtering
      if (plateStatus && plateStatus !== 'all') {
        violations = violations.filter((v) => v.vehicle?.plate_status === plateStatus);
      }

      if (paymentStatus && paymentStatus !== 'all') {
        violations = violations.filter((v) => v.payment_status === paymentStatus);
      }

      // Apply limit
      violations = violations.slice(0, limit);
    }

    // Filter by date range (always client-side)
    let filteredViolations = violations;
    if (startDate) {
      filteredViolations = filteredViolations.filter((v) => v.date >= startDate);
    }
    if (endDate) {
      filteredViolations = filteredViolations.filter((v) => v.date <= endDate);
    }

    console.log(`Found ${filteredViolations.length} violations for user: ${session.user.email}`);

    return NextResponse.json<ApiResponse<Violation[]>>({
      success: true,
      message: 'Violations retrieved successfully',
      data: filteredViolations,
      meta: {
        page,
        limit,
        total: filteredViolations.length,
      },
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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is an upload request (has images)
    if (body.images) {
      const uploadUrl = new URL('/api/violations/upload', request.url);
      return NextResponse.redirect(uploadUrl, {
        status: 307,
      });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: 'Only admins can create violations manually' },
        { status: 403 }
      );
    }

    const requiredFields = ['vehicle', 'violations', 'location'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json<ApiResponse>(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const timestamp = new Date();
    const violationId = `VIO_${timestamp.toISOString().replace(/[-:T.]/g, '').slice(0, 14)}_${body.vehicle.license_plate || 'UNKNOWN'}`;

    const totalFine = body.violations.reduce(
      (sum: number, v: any) => sum + (v.fine_amount || 0),
      0
    );

    const violationData: Omit<Violation, 'id'> = {
      violation_id: violationId,
      timestamp: timestamp.getTime(),
      date: timestamp.toISOString().split('T')[0],
      time: timestamp.toTimeString().split(' ')[0],
      datetime: timestamp.toISOString().split('T')[0],
      frame_timestamp: 0,
      is_deleted: false,
      location: body.location,
      vehicle: body.vehicle,
      violations: body.violations,
      total_fine: totalFine,
      payment_status: 'PENDING',
      evidence: body.evidence || {},
      signal_state: body.signal_state || 'UNKNOWN',
      citizen_email: body.citizen_email || null,
      citizen_name: body.citizen_name || null,
      citizen_phone: body.citizen_phone || null,
      notification_sent: false,
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    const docRef = await adminDb.collection('violations').add(violationData);

    return NextResponse.json<ApiResponse<{ id: string; violation_id: string }>>(
      {
        success: true,
        message: 'Violation created successfully',
        data: {
          id: docRef.id,
          violation_id: violationId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create violation error:', error);
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