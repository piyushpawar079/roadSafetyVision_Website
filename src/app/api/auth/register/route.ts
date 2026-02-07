// ===========================================
// USER REGISTRATION API
// POST /api/auth/register
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { hashPassword, generateId, getCurrentTimestamp, isValidEmail } from '@/utils/helpers';
import { User, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Email, password, and name are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Password must be at least 8 characters',
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if trying to register as super admin
    if (normalizedEmail === process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'This email is reserved',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const usersRef = adminDb.collection('users');
    const existingUser = await usersRef
      .where('email', '==', normalizedEmail)
      .where('isDeleted', '==', false)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user document
    const userId = generateId();
    const newUser: User = {
      id: userId,
      email: normalizedEmail,
      name: name.trim(),
      phone: phone?.trim(),
      password: hashedPassword,
      role: 'citizen', // Default role
      provider: 'credentials',
      emailVerified: false, // Needs OTP verification
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      isDeleted: false,
    };

    // Save to Firestore
    await usersRef.doc(userId).set(newUser);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Registration successful. Please verify your email with OTP.',
        data: {
          userId: userId,
          email: normalizedEmail,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
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