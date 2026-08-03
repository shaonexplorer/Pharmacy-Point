'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Loader2, Home, Package, Store, BarChart3, LogOut, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Companies', href: '/companies', icon: Store },
  { name: 'Customers', href: '/customers', icon: User },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Navigation({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">{children}</div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between border-b border-border bg-card p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <span className="text-sm font-medium text-foreground">Pharmacy Point</span>
        <div className="w-5" />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <nav className="hidden w-64 flex-col items-center gap-2 border-r border-border bg-card p-4 lg:flex lg:space-y-1 lg:pt-6">
          <div className="mb-6 flex items-center justify-center">
            <span className="text-xl font-bold text-foreground">Pharmacy Point</span>
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Sidebar */}
        <nav className="lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-card lg:p-4 lg:space-y-1 lg:pt-6 lg:ml-[-100%] lg:group-[:hover]>ml-0">
          <div className="mb-6 flex items-center justify-center lg:justify-start">
            <span className="text-xl font-bold text-foreground">Pharmacy Point</span>
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Sign Out Button in sidebar for desktop */}
      <div className="hidden lg:block lg:border-t lg:border-border lg:p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="w-full justify-start gap-3"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Mobile Footer */}
      {session && (
        <div className="lg:hidden border-t border-border p-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="w-full justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
}
