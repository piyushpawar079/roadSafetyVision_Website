// ===========================================
// SEND OTP API
// POST /api/auth/send-otp
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { generateOTP, getOTPExpiry, getCurrentTimestamp, isValidEmail, generateId } from '@/utils/helpers';
import { sendOTPEmail } from '@/services/email.service';
import { ApiResponse, OTPRecord } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Valid email is required',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const usersRef = adminDb.collection('users');
    const userSnapshot = await usersRef
      .where('email', '==', normalizedEmail)
      .where('isDeleted', '==', false)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User not found. Please register first.',
        },
        { status: 404 }
      );
    }

    const userDoc = userSnapshot.docs[0];
    const userName = userDoc.data().name;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Delete any existing OTPs for this email
    const otpRef = adminDb.collection('otp_codes');
    const existingOtps = await otpRef.where('email', '==', normalizedEmail).get();

    const batch = adminDb.batch();
    existingOtps.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Create new OTP record
    const otpId = generateId();
    const otpRecord: OTPRecord = {
      id: otpId,
      email: normalizedEmail,
      otp: otp,
      expires_at: expiresAt,
      verified: false,
      created_at: getCurrentTimestamp(),
    };

    batch.set(otpRef.doc(otpId), otpRecord);
    await batch.commit();

    // Send OTP email
    const emailSent = await sendOTPEmail(normalizedEmail, otp, userName);

    if (!emailSent) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Failed to send OTP email. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'OTP sent successfully. Please check your email.',
        data: {
          email: normalizedEmail,
          expiresIn: '10 minutes',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
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