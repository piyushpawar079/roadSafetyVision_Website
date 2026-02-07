// ===========================================
// PROFILE PAGE
// ===========================================

'use client';

import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getInitials, formatDateTime } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Settings,
  Edit,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session } = useSession();

  const user = session?.user;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and manage your profile information"
      >
        <Link href="/dashboard/settings">
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Edit Settings
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {getInitials(user?.name || 'U')}
                </AvatarFallback>
              </Avatar>

              <h2 className="mt-4 text-xl font-semibold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>

              <Badge
                variant="outline"
                className="mt-3 bg-primary/10 text-primary"
              >
                <Shield className="mr-1 h-3 w-3" />
                {user?.role?.replace('_', ' ')}
              </Badge>

              <Separator className="my-6" />

              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user?.email}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Email Verified</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Member since Jan 2024</span>
                </div>
              </div>

              <Link href="/dashboard/settings" className="w-full mt-6">
                <Button variant="outline" className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Activity & Stats */}
        <div className="space-y-6 lg:col-span-2">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{user?.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Account Type</p>
                  <p className="font-medium capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Email Verification
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - For Citizens */}
          {user?.role === 'citizen' && (
            <Card>
              <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-3xl font-bold text-primary">0</p>
                    <p className="text-sm text-muted-foreground">
                      Total Violations
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-600">0</p>
                    <p className="text-sm text-muted-foreground">Pending Fines</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">₹0</p>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats - For Admins */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Card>
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-3xl font-bold text-primary">0</p>
                    <p className="text-sm text-muted-foreground">
                      Plates Verified
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-muted-foreground">
                      Violations Reviewed
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">0</p>
                    <p className="text-sm text-muted-foreground">
                      Days Active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  No recent activity to display
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}