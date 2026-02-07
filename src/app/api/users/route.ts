// ===========================================
// USERS API
// GET - List users (admin/super admin only)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase-admin';
import { User, ApiResponse } from '@/types';

// GET - List users
export async function GET(request: NextRequest) {
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

    // Only admins and super admin can list users
    if (session.user.role === 'citizen') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Access denied',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const usersRef = adminDb.collection('users');
    let query: FirebaseFirestore.Query = usersRef.where('isDeleted', '==', false);

    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.get();

    const users = snapshot.docs.map((doc) => {
      const userData = doc.data() as User;
      // Remove sensitive fields
      const { password, ...safeUser } = userData;
      return {
        ...safeUser,
        id: doc.id,
      };
    });

    return NextResponse.json<ApiResponse<Omit<User, 'password'>[]>>(
      {
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
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