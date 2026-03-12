// ===========================================
// STRIPE WEBHOOK HANDLER
// POST /api/payments/webhook
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';
import { generateReceiptPDF } from '@/services/pdf.service';
// import { sendPaymentReceiptEmail } from '@/services/email.service';
import { Violation } from '@/types';
import { getCurrentTimestamp } from '@/utils/helpers';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const metadata = session.metadata;

      if (!metadata?.violation_ids) {
        console.error('No violation_ids in metadata');
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const violationIds: string[] = JSON.parse(metadata.violation_ids);

      // Update payments and violations
      const paymentsRef = adminDb.collection('payments');
      const violationsRef = adminDb.collection('violations');

      for (const violationId of violationIds) {
        // Update payment status
        const paymentSnapshot = await paymentsRef
          .where('stripe_session_id', '==', session.id)
          .where('violation_id', '==', violationId)
          .limit(1)
          .get();

        if (!paymentSnapshot.empty) {
          await paymentSnapshot.docs[0].ref.update({
            status: 'completed',
            stripe_payment_intent: session.payment_intent,
            completed_at: getCurrentTimestamp(),
          });
        }

        // Update violation payment status
        const violationDoc = await violationsRef.doc(violationId).get();

        if (violationDoc.exists) {
          await violationsRef.doc(violationId).update({
            payment_status: 'PAID',
            updated_at: getCurrentTimestamp(),
          });

          // Send receipt email
          const violation = violationDoc.data() as Violation;

          if (violation.citizen_email && violation.citizen_name) {
            try {
              const updatedViolation: Violation = {
                ...violation,
                payment_status: 'PAID',
              };

              const receiptPdf = await generateReceiptPDF(
                updatedViolation,
                new Date()
              );

              // await sendPaymentReceiptEmail(
              //   updatedViolation,
              //   violation.citizen_email,
              //   violation.citizen_name,
              //   receiptPdf
              // );
            } catch (emailError) {
              console.error('Failed to send receipt email:', emailError);
            }
          }
        }
      }

      console.log(`Payment completed for violations: ${violationIds.join(', ')}`);
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Don't return error - Stripe will retry
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}