// ===========================================
// VERIFY OTP API
// POST /api/auth/verify-otp
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { isOTPExpired, getCurrentTimestamp, isValidEmail } from '@/utils/helpers';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    // Validate inputs
    if (!email || !otp) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Email and OTP are required',
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Find OTP record
    const otpRef = adminDb.collection('otp_codes');
    const otpSnapshot = await otpRef
      .where('email', '==', normalizedEmail)
      .where('otp', '==', otp)
      .where('verified', '==', false)
      .limit(1)
      .get();

    if (otpSnapshot.empty) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid OTP',
        },
        { status: 400 }
      );
    }

    const otpDoc = otpSnapshot.docs[0];
    const otpData = otpDoc.data();

    // Check if OTP is expired
    if (isOTPExpired(otpData.expires_at)) {
      // Delete expired OTP
      await otpDoc.ref.delete();

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'OTP has expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Mark OTP as verified and delete it
    await otpDoc.ref.delete();

    // Update user's email verification status
    const usersRef = adminDb.collection('users');
    const userSnapshot = await usersRef
      .where('email', '==', normalizedEmail)
      .where('isDeleted', '==', false)
      .limit(1)
      .get();

    if (!userSnapshot.empty) {
      await userSnapshot.docs[0].ref.update({
        emailVerified: true,
        updatedAt: getCurrentTimestamp(),
      });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Email verified successfully. You can now login.',
        data: {
          email: normalizedEmail,
          verified: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
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