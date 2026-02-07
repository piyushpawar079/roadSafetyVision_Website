// ===========================================
// SINGLE VIOLATION API
// GET - Get violation by ID
// PATCH - Update violation (admin plate correction)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase-admin';
import { lookupVehicleOwner } from '@/utils/vehicle-registry';
import { sendViolationNotification } from '@/services/email.service';
import { Violation, ApiResponse } from '@/types';

// Type for route params
type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET - Get single violation
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Await params in Next.js 15
    const { id: violationId } = await params;
    
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

    console.log('Fetching violation with ID:', violationId);

    // First, try to find by document ID
    let violationDoc = await adminDb.collection('violations').doc(violationId).get();
    let violation: Violation | null = null;
    let docId = violationId;

    if (violationDoc.exists) {
      violation = { id: violationDoc.id, ...violationDoc.data() } as Violation;
    } else {
      // If not found by doc ID, try to find by violation_id field
      console.log('Document not found by ID, searching by violation_id field...');
      const querySnapshot = await adminDb
        .collection('violations')
        .where('violation_id', '==', violationId)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        docId = doc.id;
        violation = { id: doc.id, ...doc.data() } as Violation;
        console.log('Found violation by violation_id field, doc ID:', docId);
      }
    }

    if (!violation) {
      console.log('Violation not found for ID:', violationId);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Violation not found',
        },
        { status: 404 }
      );
    }

    // Check if soft deleted
    if (violation.is_deleted) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Violation not found',
        },
        { status: 404 }
      );
    }

    // Role-based access check
    if (session.user.role === 'citizen' && violation.citizen_email !== session.user.email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Access denied',
        },
        { status: 403 }
      );
    }

    return NextResponse.json<ApiResponse<Violation>>(
      {
        success: true,
        message: 'Violation retrieved successfully',
        data: violation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get violation error:', error);
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

// PATCH - Update violation (admin plate correction)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Await params in Next.js 15
    const { id: violationId } = await params;
    
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

    // Only admins and super_admin can update violations
    if (session.user.role === 'citizen') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Access denied. Admin privileges required.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { license_plate } = body;

    if (!license_plate) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'License plate is required',
        },
        { status: 400 }
      );
    }

    // First, try to find by document ID
    let violationRef = adminDb.collection('violations').doc(violationId);
    let violationDoc = await violationRef.get();
    let docId = violationId;

    if (!violationDoc.exists) {
      // If not found by doc ID, try to find by violation_id field
      const querySnapshot = await adminDb
        .collection('violations')
        .where('violation_id', '==', violationId)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        docId = doc.id;
        violationRef = adminDb.collection('violations').doc(docId);
        violationDoc = await violationRef.get();
      }
    }

    if (!violationDoc.exists) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Violation not found',
        },
        { status: 404 }
      );
    }

    const currentViolation = violationDoc.data() as Violation;

    // Check if soft deleted
    if (currentViolation.is_deleted) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Violation not found',
        },
        { status: 404 }
      );
    }

    // Look up new plate in registry
    const vehicleOwner = lookupVehicleOwner(license_plate);

    let newPlateStatus = currentViolation.vehicle.plate_status;
    let citizenEmail = currentViolation.citizen_email;
    let citizenName = currentViolation.citizen_name;
    let citizenPhone = currentViolation.citizen_phone;
    let notificationSent = currentViolation.notification_sent;

    if (vehicleOwner) {
      newPlateStatus = 'VERIFIED';
      citizenEmail = vehicleOwner.email;
      citizenName = vehicleOwner.name;
      citizenPhone = vehicleOwner.phone || null;
    } else {
      // Plate corrected but still not in registry
      newPlateStatus = 'MANUAL_REVIEW';
    }

    // Update violation
    const updatedData = {
      'vehicle.license_plate': license_plate.toUpperCase(),
      'vehicle.plate_status': newPlateStatus,
      citizen_email: citizenEmail,
      citizen_name: citizenName,
      citizen_phone: citizenPhone,
      updated_at: Date.now(),
    };

    await violationRef.update(updatedData);

    // Send notification if plate is now verified and notification wasn't sent before
    if (newPlateStatus === 'VERIFIED' && !notificationSent && citizenEmail && citizenName) {
      try {
        // Get full updated violation
        const updatedDoc = await violationRef.get();
        const fullViolation = { id: docId, ...updatedDoc.data() } as Violation;

        // Send email notification
        const emailSent = await sendViolationNotification(
          citizenEmail,
          citizenName,
          fullViolation
        );

        if (emailSent) {
          notificationSent = true;
          await violationRef.update({
            notification_sent: true,
          });
        }
      } catch (emailError) {
        console.error('Failed to send violation notification after plate correction:', emailError);
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `Violation updated successfully. ${notificationSent && !currentViolation.notification_sent ? 'Notification sent to citizen.' : ''}`,
        data: {
          violation_id: violationId,
          doc_id: docId,
          new_plate: license_plate.toUpperCase(),
          plate_status: newPlateStatus,
          notification_sent: notificationSent,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update violation error:', error);
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