import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Pharmacy Point
          </h1>
          <p className="mt-3 text-muted-foreground sm:max-w-md sm:text-lg">
            Your comprehensive pharmacy management system for inventory, sales, and customer care
          </p>
        </div>
        <Card className="w-full max-w-md border-border">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button asChild className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
