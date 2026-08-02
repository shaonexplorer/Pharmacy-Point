'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Company } from '@pharmacy-point/types';
import { useCreateCompany, useUpdateCompany } from '@/hooks/useCompanies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, X, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Zod schema for company validation
const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  company?: Company | null;
  mode: 'create' | 'edit';
}

export function CompanyForm({ company, mode }: CompanyFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: company?.name ?? '',
    description: company?.description ?? '',
    image: company?.image ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const apiError = createMutation.error?.message || updateMutation.error?.message || null;

  useEffect(() => {
    if (company) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: company.name,
        description: company.description ?? '',
        image: company.image ?? '',
      });
    }
  }, [company]);

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
      companySchema.parse(formData);
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
      if (mode === 'create') {
        await createMutation.mutateAsync(formData);
        router.push('/companies');
        router.refresh();
      } else if (mode === 'edit' && company) {
        await updateMutation.mutateAsync({ id: company.id, data: formData });
        router.push(`/companies/${company.id}`);
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
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{apiError}</div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            Company Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Pharmacy Plus"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="bg-background border-border"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Company description..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="bg-background border-border min-h-[100px]"
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <Label htmlFor="image" className="text-foreground">
            Logo Image URL
          </Label>
          <Input
            id="image"
            type="url"
            placeholder="https://example.com/logo.png"
            value={formData.image}
            onChange={(e) => handleChange('image', e.target.value)}
            className="bg-background border-border"
          />
          {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href={mode === 'edit' && company ? `/companies/${company.id}` : '/companies'}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
          {mode === 'edit' && company && (
            <Button
              variant="outline"
              type="button"
              onClick={handleDelete}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
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
              {mode === 'create' ? 'Create Company' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
