// ===========================================
// NEXTAUTH CONFIGURATION
// Handles all authentication
// ===========================================

import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { adminDb } from '@/lib/firebase-admin';
import { comparePassword } from '@/utils/helpers';
import { User } from '@/types';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      emailVerified: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Credentials Provider (Email + Password)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const email = credentials.email.toLowerCase();
        const password = credentials.password;

        // Check if super admin
        if (
          email === process.env.SUPER_ADMIN_EMAIL?.toLowerCase() &&
          password === process.env.SUPER_ADMIN_PASSWORD
        ) {
          return {
            id: 'super_admin',
            email: email,
            name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
            role: 'super_admin',
            emailVerified: true,
          };
        }

        // Find user in Firestore
        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef
          .where('email', '==', email)
          .where('isDeleted', '==', false)
          .limit(1)
          .get();

        if (snapshot.empty) {
          throw new Error('No user found with this email');
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data() as User;

        // Verify password
        if (!userData.password) {
          throw new Error('Please login with Google');
        }

        const isValidPassword = await comparePassword(password, userData.password);

        if (!isValidPassword) {
          throw new Error('Invalid password');
        }

        // Check if email is verified
        if (!userData.emailVerified) {
          throw new Error('Please verify your email first');
        }

        return {
          id: userDoc.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          emailVerified: userData.emailVerified,
        };
      },
    }),
  ],

  callbacks: {
    // Handle sign in (especially for Google OAuth)
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        // Check if super admin trying to use Google (not allowed)
        if (email === process.env.SUPER_ADMIN_EMAIL?.toLowerCase()) {
          return false; // Super admin must use credentials
        }

        // Check if user exists
        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef
          .where('email', '==', email)
          .where('isDeleted', '==', false)
          .limit(1)
          .get();

        if (snapshot.empty) {
          // Create new user with Google
          const newUser: Omit<User, 'id'> = {
            email: email,
            name: user.name || 'User',
            role: 'citizen', // Default role
            provider: 'google',
            emailVerified: true, // Google accounts are verified
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDeleted: false,
          };

          const docRef = await usersRef.add(newUser);
          user.id = docRef.id;
          user.role = 'citizen';
          user.emailVerified = true;
        } else {
          // User exists - get their CURRENT role from database
          const existingUser = snapshot.docs[0].data() as User;
          user.id = snapshot.docs[0].id;
          user.role = existingUser.role; // This gets the updated role
          user.emailVerified = existingUser.emailVerified;
        }
      }
      return true;
    },

    // Add custom fields to JWT
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }

      // Handle session update (when user role changes)
      if (trigger === 'update' && session) {
        // Fetch fresh user data from database
        if (token.email && token.id !== 'super_admin') {
          const usersRef = adminDb.collection('users');
          const snapshot = await usersRef
            .where('email', '==', token.email)
            .where('isDeleted', '==', false)
            .limit(1)
            .get();

          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as User;
            token.role = userData.role;
            token.name = userData.name;
          }
        }
      }

      // Always refresh role from database on each request (optional but recommended)
      // This ensures role changes take effect immediately
      if (token.email && token.id !== 'super_admin') {
        try {
          const usersRef = adminDb.collection('users');
          const snapshot = await usersRef
            .where('email', '==', token.email)
            .where('isDeleted', '==', false)
            .limit(1)
            .get();

          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as User;
            token.role = userData.role;
          }
        } catch (error) {
          console.error('Error refreshing user role:', error);
        }
      }

      return token;
    },

    // Add custom fields to session
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        emailVerified: token.emailVerified,
      };
      return session;
    },

    // Redirect after sign in based on role
    async redirect({ url, baseUrl }) {
      // If it's a relative URL, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If it's the same origin, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };