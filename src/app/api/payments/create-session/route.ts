// ===========================================
// CREATE STRIPE CHECKOUT SESSION
// POST /api/payments/create-session
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase-admin';
import { stripe } from '@/lib/stripe';
import { Violation, Payment, ApiResponse } from '@/types';
import { generateId, getCurrentTimestamp } from '@/utils/helpers';

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

    // Only citizens can make payments
    if (session.user.role !== 'citizen') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Only citizens can make payments',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { violation_ids } = body; // Array of violation IDs to pay

    if (!violation_ids || !Array.isArray(violation_ids) || violation_ids.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'At least one violation ID is required',
        },
        { status: 400 }
      );
    }

    // Fetch violations
    const violationsRef = adminDb.collection('violations');
    const violations: Violation[] = [];
    let totalAmount = 0;

    for (const violationId of violation_ids) {
      const violationDoc = await violationsRef.doc(violationId).get();

      if (!violationDoc.exists) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: `Violation ${violationId} not found`,
          },
          { status: 404 }
        );
      }

      const violation = violationDoc.data() as Violation;

      // Check if this violation belongs to the user
      if (violation.citizen_email !== session.user.email) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: 'Access denied to one or more violations',
          },
          { status: 403 }
        );
      }

      // Check if already paid
      if (violation.payment_status === 'PAID') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: `Violation ${violationId} is already paid`,
          },
          { status: 400 }
        );
      }

      violations.push(violation);
      totalAmount += violation.total_fine;
    }

    // Create line items for Stripe
    const lineItems = violations.map((v) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: `Traffic Violation Fine - ${v.violation_id}`,
          description: v.violations.map((vt) => vt.type.replace('_', ' ')).join(', '),
        },
        unit_amount: v.total_fine * 100, // Stripe expects amount in paise
      },
      quantity: 1,
    }));

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/citizen/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/citizen/payments/cancel`,
      customer_email: session.user.email,
      metadata: {
        user_id: session.user.id,
        violation_ids: JSON.stringify(violation_ids),
      },
    });

    // Create payment records
    const paymentsRef = adminDb.collection('payments');

    for (const violationId of violation_ids) {
      const paymentId = generateId();
      const payment: Payment = {
        id: paymentId,
        violation_id: violationId,
        user_id: session.user.id,
        user_email: session.user.email,
        amount: violations.find((v) => v.violation_id === violationId)?.total_fine || 0,
        stripe_session_id: checkoutSession.id,
        status: 'pending',
        created_at: getCurrentTimestamp(),
      };

      await paymentsRef.doc(paymentId).set(payment);
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Checkout session created successfully',
        data: {
          checkout_url: checkoutSession.url,
          session_id: checkoutSession.id,
          total_amount: totalAmount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create checkout session error:', error);
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