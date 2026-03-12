// ===========================================
// SINGLE USER API
// GET - Get user by ID
// PATCH - Update user
// DELETE - Soft delete user (super admin only)
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { adminDb } from '@/lib/firebase-admin';
import { User, ApiResponse } from '@/types';
import { getCurrentTimestamp } from '@/utils/helpers';

// GET - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const userId = id;

    // Citizens can only view their own profile
    if (session.user.role === 'citizen' && session.user.id !== userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Access denied',
        },
        { status: 403 }
      );
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    const userData = userDoc.data() as User;

    // Check if soft deleted
    if (userData.isDeleted) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Remove sensitive fields
    const { password, ...safeUser } = userData;

    return NextResponse.json<ApiResponse<Omit<User, 'password'>>>(
      {
        success: true,
        message: 'User retrieved successfully',
        data: safeUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
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

// PATCH - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const userId = id;

    // Citizens can only update their own profile
    // Admins can only update their own profile
    // Super admin can update anyone
    if (session.user.role !== 'super_admin' && session.user.id !== userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Access denied',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, phone } = body;

    // Validate at least one field to update
    if (!name && !phone) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'At least one field (name or phone) is required',
        },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    const userData = userDoc.data() as User;

    if (userData.isDeleted) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Partial<User> = {
      updatedAt: getCurrentTimestamp(),
    };

    if (name) {
      updateData.name = name.trim();
    }

    if (phone) {
      updateData.phone = phone.trim();
    }

    await userRef.update(updateData);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'User updated successfully',
        data: {
          id: userId,
          ...updateData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
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

// DELETE - Soft delete user (super admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Only super admin can delete users
    if (session.user.role !== 'super_admin') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Access denied. Super admin privileges required.',
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = id;

    // Prevent self-deletion
    if (session.user.id === userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Cannot delete your own account',
        },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    const userData = userDoc.data() as User;

    if (userData.isDeleted) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User already deleted',
        },
        { status: 400 }
      );
    }

    // Soft delete
    await userRef.update({
      isDeleted: true,
      updatedAt: getCurrentTimestamp(),
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'User deleted successfully',
        data: {
          id: userId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
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