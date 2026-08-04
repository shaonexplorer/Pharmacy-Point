'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Customer } from '@pharmacy-point/types';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, X } from 'lucide-react';
import Link from 'next/link';

// Zod schema for customer validation
const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Must be a valid email').trim().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer | null;
  mode: 'create' | 'edit';
}

export function CustomerForm({ customer, mode }: CustomerFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: customer?.name ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    address: customer?.address ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const apiError = createMutation.error?.message || updateMutation.error?.message || null;

  useEffect(() => {
    if (customer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: customer.name,
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        address: customer.address ?? '',
      });
    }
  }, [customer]);

  // Clear error when starting a new mutation
  useEffect(() => {
    if (createMutation.isPending || updateMutation.isPending) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrors({});
    }
  }, [createMutation.isPending, updateMutation.isPending]);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    try {
      customerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      // Filter out empty string fields
      const cleanedData = {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(cleanedData);
        router.push('/customers');
        router.refresh();
      } else if (mode === 'edit' && customer) {
        await updateMutation.mutateAsync({ id: customer.id, data: cleanedData });
        router.push(`/customers/${customer.id}`);
        router.refresh();
      }
    } catch {
      // Error is surfaced via mutation error state
    }
  };

  const handleDelete = async () => {
    // This is handled in the page component for now
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="rounded-lg bg-error/10 border border-error/30 p-3 text-body-sm text-error">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Customer Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-body-md text-foreground">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., John Doe"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-body-md text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-body-md text-foreground">
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address" className="text-body-md text-foreground">
            Address
          </Label>
          <Textarea
            id="address"
            placeholder="123 Main St, City, State, ZIP"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={errors.address ? 'border-destructive' : ''}
            rows={3}
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href={mode === 'edit' && customer ? `/customers/${customer.id}` : '/customers'}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Create Customer' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
