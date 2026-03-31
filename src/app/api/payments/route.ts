// src/app/api/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase-admin';
import { sendPaymentSuccessEmail } from '@/services/email.service';
import { Payment, Violation } from '@/types';
import { Query } from 'firebase-admin/firestore';
import { any } from 'zod';

// POST - Process a new payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { violation_id } = body;
    console.log(violation_id)
    if (!violation_id) {
      return NextResponse.json(
        { success: false, message: 'Violation ID is required' },
        { status: 400 }
      );
    }

    const snapshot = await adminDb
      .collection('violations')
      .where('violation_id', '==', violation_id)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, message: 'Violation not found' },
        { status: 404 }
      );
    }

    const violationDoc = snapshot.docs[0];    
    // // Get the violation
    // const violationDoc = await adminDb.collection('violations').doc(violation_id).get();
    // console.log(violationDoc)
    
    if (!violationDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Violation not found' },
        { status: 404 }
      );
    }

    const violation = { id: violationDoc.id, ...violationDoc.data() } as Violation & { id: string };;

    // Check if already paid
    if (violation.payment_status === 'PAID') {
      return NextResponse.json(
        { success: false, message: 'This violation has already been paid' },
        { status: 400 }
      );
    }

    // Check if user is authorized to pay this violation
    if (session.user.role === 'citizen' && violation.citizen_email !== session.user.email) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to pay this violation' },
        { status: 403 }
      );
    }

    // Generate payment ID and transaction ID
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const payment_id = `PAY_${dateStr}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const transaction_id = `TXN_${dateStr}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const paymentData = {
      payment_id,
      violation_id: violationDoc.id,
      violation_number: violation.violation_id,
      
      user_id: session.user.id || session.user.email,
      user_email: session.user.email,
      user_name: session.user.name || 'Unknown',
      user_phone: violation.citizen_phone || '',
      
      amount: violation.total_fine,
      payment_method: 'demo_payment',
      payment_status: 'completed',
      
      transaction_id,
      payment_date: Date.now(),
      
      license_plate: violation.vehicle.license_plate,
      violation_type: violation.violations.map((v: any) => v.type).join(', '),
      
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    // Save payment to Firestore
    const paymentRef = await adminDb.collection('payments').add(paymentData);

    // Update violation status
    await adminDb.collection('violations').doc(violation_id).update({
      payment_status: 'PAID',
      payment_id: paymentRef.id,
      payment_date: Date.now(),
      transaction_id,
      updated_at: Date.now(),
    });

    // Send payment success email
    try {
      await sendPaymentSuccessEmail(
        session.user.email!,
        session.user.name || 'User',
        {
          ...paymentData,
          id: paymentRef.id,
        }
      );
    } catch (emailError) {
      console.error('Failed to send payment success email:', emailError);
      // Don't fail the payment if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment_id: paymentRef.id,
        transaction_id,
        amount: violation.total_fine,
      },
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process payment', error: String(error) },
      { status: 500 }
    );
  }
}

// GET - List payments (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const user_email = searchParams.get('user_email');
    const status = searchParams.get('status');

    let query: any = adminDb.collection('payments') as unknown as Query;

    // Role-based filtering
    if (session.user.role === 'citizen') {
      query = query.where('user_email', '==', session.user.email);
    } else if (user_email) {
      query = query.where('user_email', '==', user_email);
    }

    // Status filter
    if (status) {
      query = query.where('payment_status', '==', status);
    }

    // Order by payment date (newest first)
    query = query.orderBy('payment_date', 'desc');

    // Pagination
    const snapshot = await query.limit(limit).get();
    
    const payments = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Calculate stats
    const statsSnapshot = await adminDb.collection('payments')
      .where('payment_status', '==', 'completed')
      .get();
    
    let totalAmount = 0;
    statsSnapshot.docs.forEach(doc => {
      totalAmount += doc.data().amount || 0;
    });

    return NextResponse.json({
      success: true,
      data: payments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        stats: {
          total_payments: statsSnapshot.size,
          total_amount: totalAmount,
        },
      },
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payments', error: String(error) },
      { status: 500 }
    );
  }
}