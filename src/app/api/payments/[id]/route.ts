// src/app/api/payments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase-admin';
import { Payment } from '@/types';

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET - Get single payment details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const paymentDoc = await adminDb.collection('payments').doc(id).get();

    if (!paymentDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = { id: paymentDoc.id, ...paymentDoc.data() } as Payment;

    // Check authorization
    if (
      session.user.role === 'citizen' &&
      payment.user_email !== session.user.email
    ) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment', error: String(error) },
      { status: 500 }
    );
  }
}