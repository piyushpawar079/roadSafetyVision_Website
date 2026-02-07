// ===========================================
// DATABASE SEED API
// POST /api/seed
// Creates initial super admin (run once during setup)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { hashPassword, getCurrentTimestamp, generateId } from '@/utils/helpers';
import { User, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check for secret key to prevent unauthorized seeding
    const body = await request.json();
    const { secret_key } = body;

    if (secret_key !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Invalid secret key',
        },
        { status: 401 } 
      );
    }

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    if (!superAdminEmail || !superAdminPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Super admin credentials not configured in environment',
        },
        { status: 500 }
      );
    }

    // Check if super admin already exists
    const usersRef = adminDb.collection('users');
    const existingAdmin = await usersRef
      .where('email', '==', superAdminEmail)
      .where('role', '==', 'super_admin')
      .limit(1)
      .get();

    if (!existingAdmin.empty) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Super admin already exists',
        },
        { status: 409 }
      );
    }

    // Create super admin
    const hashedPassword = await hashPassword(superAdminPassword);
    const superAdminId = generateId();

    const superAdmin: User = {
      id: superAdminId,
      email: superAdminEmail,
      name: superAdminName,
      password: hashedPassword,
      role: 'super_admin',
      provider: 'credentials',
      emailVerified: true,
      createdAt: getCurrentTimestamp(),
      updatedAt: getCurrentTimestamp(),
      isDeleted: false,
    };

    await usersRef.doc(superAdminId).set(superAdmin);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Super admin created successfully',
        data: {
          email: superAdminEmail,
          name: superAdminName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
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