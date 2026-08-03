import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 p-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Pharmacy <span className="text-primary">Point</span>
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground sm:text-lg">
            Your comprehensive pharmacy management system for inventory, sales, and customer care.
          </p>
        </div>
        <Card className="w-full max-w-md border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">Welcome</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col gap-2">
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
