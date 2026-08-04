'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signUp.email(
        {
          name,
          email,
          password,
          callbackURL: '/dashboard',
        },
        {
          onRequest: () => setIsLoading(true),
          onSuccess: () => router.push('/dashboard'),
          onError: (ctx) => setError(ctx.error?.message || 'Sign up failed'),
          onRequestError: (err: Error) => setError(err.message || 'An error occurred'),
        }
      );
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border card-elevated">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-headline-lg text-center text-foreground">Create Account</CardTitle>
          <CardDescription className="text-center text-body-md text-on-surface-variant">
            Enter your details to create a pharmacy account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-error/10 border border-error/30 p-3 text-body-sm text-error">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-body-md text-foreground">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-body-md text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="pharmacist@pharmacypoint.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-body-md text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="bg-background"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center justify-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="ml-1 underline-offset-4 hover:underline text-primary">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
