import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Please sign in to view this page.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to Pharmacy Point</h1>
        <p className="text-muted-foreground mt-4">Logged in as {session.user.email}</p>
        <p className="mt-2">User ID: {session.user.id}</p>
      </div>
    </div>
  );
}
