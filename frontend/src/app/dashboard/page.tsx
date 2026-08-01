'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, Package } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, error, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Not Authenticated</CardTitle>
            <CardDescription className="text-muted-foreground">
              {error?.message || 'You need to sign in to view this page'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Welcome to Pharmacy Point</CardTitle>
          <CardDescription className="text-muted-foreground">
            You are logged in as {session.user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">User ID</p>
            <p className="font-mono text-foreground">{session.user.id}</p>
          </div>
          {session.user.name && (
            <div className="rounded-md bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-foreground">{session.user.name}</p>
            </div>
          )}
          <Button asChild className="w-full">
            <Link href="/products">
              <Package className="mr-2 h-4 w-4" />
              Manage Products
            </Link>
          </Button>
          <Button variant="outline" className="w-full" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
