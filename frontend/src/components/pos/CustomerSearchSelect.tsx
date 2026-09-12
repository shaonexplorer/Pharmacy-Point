'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Customer } from '@pharmacy-point/types';
import { Popover } from 'radix-ui';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, User, Phone, Plus, Check, X, Loader2 } from 'lucide-react';
import { useCreateCustomer } from '@/hooks/useCustomers';

interface CustomerSearchSelectProps {
  customers: Customer[];
  isLoadingCustomers: boolean;
  customerId: string | null;
  onCustomerChange: (customerId: string | null, customer?: Customer | null) => void;
}

/**
 * Clinical Precision — Searchable Customer Select with Create-on-the-fly
 *
 * A Popover-based searchable dropdown for selecting customers by name or phone
 * in the POS checkout. Includes an inline "create new customer" form so staff
 * can add a walk-in customer without leaving the checkout flow.
 *
 * Backend supports search by name, email, phone via GET /api/customers?search=
 * — we filter client-side on the loaded list for instant UX.
 */
export function CustomerSearchSelect({
  customers,
  isLoadingCustomers,
  customerId,
  onCustomerChange,
}: CustomerSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createEmail, setCreateEmail] = useState('');

  const createMutation = useCreateCustomer();

  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus the search input when the popover opens
  useEffect(() => {
    if (open) {
      setSearch('');
      setShowCreateForm(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Filter customers by name or phone (case-insensitive, partial match)
  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const query = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.phone ?? '').toLowerCase().includes(query) ||
        (c.email ?? '').toLowerCase().includes(query)
    );
  }, [search, customers]);

  const selectedCustomer = customerId ? customers.find((c) => c.id === customerId) : undefined;

  const handleSelect = (customer: Customer) => {
    onCustomerChange(customer.id, customer);
    setOpen(false);
  };

  const handleClear = () => {
    onCustomerChange(null, null);
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!createName.trim() || !createPhone.trim()) return;

    try {
      const response = await createMutation.mutateAsync({
        name: createName.trim(),
        phone: createPhone.trim(),
        email: createEmail.trim() || undefined,
      });

      // Select the newly created customer so the POS state picks up
      // loyalty tier, due amount, etc. right away.
      const newCustomer = response?.data;
      if (newCustomer) {
        onCustomerChange(newCustomer.id, newCustomer);
      } else {
        onCustomerChange(null, null);
      }

      setCreateName('');
      setCreatePhone('');
      setCreateEmail('');
      setShowCreateForm(false);
      setOpen(false);
    } catch {
      // Error is surfaced via mutation error state
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded border border-input',
            'bg-background px-3 text-left text-sm transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            !selectedCustomer && 'text-muted-foreground'
          )}
          disabled={isLoadingCustomers}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedCustomer ? (
              <>
                <User className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate font-medium">{selectedCustomer.name}</span>
                {selectedCustomer.phone && (
                  <span className="text-muted-foreground">({selectedCustomer.phone})</span>
                )}
              </>
            ) : (
              <>
                <User className="h-4 w-4 shrink-0" />
                <span>Walk-in Customer</span>
              </>
            )}
          </span>
          {selectedCustomer && (
            <X
              className="h-4 w-4 shrink-0 text-muted-foreground opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          {!selectedCustomer && <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />}
        </button>
      </Popover.Trigger>

      <Popover.Content
        sideOffset={8}
        className={cn(
          ' z-50 w-[320px] max-w-[90vw] border bg-popover p-2 shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:fade-out-0',
          'rounded-lg border-border'
        )}
        align="start"
      >
        <div className="p-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 border-0 border-b border-border rounded-none focus:ring-0 focus:border-primary"
            autoComplete="off"
          />
        </div>

        <div className="max-h-60 overflow-y-auto px-1">
          {isLoadingCustomers ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading customers...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              {search && !showCreateForm ? (
                <button
                  type="button"
                  onClick={() => {
                    setCreateName(search);
                    setShowCreateForm(true);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-accent"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  Create &quot;{search}&quot;
                </button>
              ) : (
                search && 'No customers found'
              )}
            </div>
          ) : (
            filtered.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => handleSelect(customer)}
                className={cn(
                  'flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm',
                  'hover:bg-accent hover:text-accent-foreground',
                  customerId === customer.id && 'bg-primary/10 text-primary'
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tertiary/10">
                  <User className="h-4 w-4 text-tertiary" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium">{customer.name}</span>
                  {customer.phone && (
                    <span className="text-xs text-muted-foreground">{customer.phone}</span>
                  )}
                  {customer.email && (
                    <span className="text-xs text-muted-foreground">{customer.email}</span>
                  )}
                </div>
                {customer.dueAmount > 0 && (
                  <span className="ml-auto text-xs font-medium text-destructive">
                    Due: ${customer.dueAmount.toFixed(2)}
                  </span>
                )}
                {customerId === customer.id && <Check className="ml-auto h-4 w-4 text-primary" />}
              </button>
            ))
          )}
        </div>

        {/* Create New Customer Form */}
        {showCreateForm && (
          <div className="border-t border-border p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">New Customer</p>
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                placeholder="Full Name *"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="h-8 text-sm"
              />
              <Input
                type="tel"
                placeholder="Phone *"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                className="h-8 text-sm"
              />
              <Input
                type="email"
                placeholder="Email (optional)"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            {createMutation.isError && (
              <p className="text-xs text-destructive">
                {createMutation.error?.message || 'Failed to create customer'}
              </p>
            )}
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => setShowCreateForm(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleCreate}
                disabled={createMutation.isPending || !createName.trim() || !createPhone.trim()}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>Create</>
                )}
              </Button>
            </div>
          </div>
        )}

        {!search && filtered.length > 0 && !showCreateForm && (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center w-full border-t border-border px-2 py-2 text-left text-sm text-primary hover:bg-accent"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add new customer
          </button>
        )}

        {!search && filtered.length > 0 && !showCreateForm && (
          <div className="border-t border-border bg-surface-container-low/40 px-2 py-1.5 text-xs text-muted-foreground">
            {customers.length} customer{customers.length !== 1 ? 's' : ''} loaded
          </div>
        )}
      </Popover.Content>
    </Popover.Root>
  );
}
