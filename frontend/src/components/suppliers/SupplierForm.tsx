'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Supplier, CreateSupplierInput, SupplierRepresentative } from '@pharmacy-point/types';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, X, Trash2, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/* ───────────────────────────────────────────────────────────────────────── *
 * Clinical Precision — Supplier Form
 *
 * Includes inline representative management: each supplier can have multiple
 * representatives (medical promotion officers / sales reps).  Representatives
 * are edited inline in a sub-table with add / edit / remove actions.
 * ───────────────────────────────────────────────────────────────────────── */

// Zod schema mirrors the backend DTO
// Uses .nullish() to accept null | undefined | string,
// handling API responses that return null for optional fields
const representativeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').nullish().or(z.literal('')),
  phone: z.string().nullish(),
  whatsappNumber: z.string().nullish(),
  designation: z.string().nullish(),
  address: z.string().nullish(),
  notes: z.string().nullish(),
});

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contactName: z.string().nullish(),
  email: z.string().email('Invalid email').nullish().or(z.literal('')),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  leadTimeDays: z.number().int().positive().default(7),
  paymentTerms: z.string().optional().default('Net 30'),
  performanceRating: z.number().min(0).max(5).optional().default(5),
  representatives: z.array(representativeSchema).optional(),
});

type FormData = z.infer<typeof supplierSchema>;
type RepFormData = z.infer<typeof representativeSchema>;

interface SupplierFormProps {
  supplier?: Supplier | null;
  mode: 'create' | 'edit';
}

export function SupplierForm({ supplier, mode }: SupplierFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: supplier?.name ?? '',
    contactName: supplier?.contactName ?? '',
    email: supplier?.email ?? '',
    phone: supplier?.phone ?? '',
    address: supplier?.address ?? '',
    leadTimeDays: supplier?.leadTimeDays ?? 7,
    paymentTerms: supplier?.paymentTerms ?? 'Net 30',
    performanceRating: supplier?.performanceRating ?? 5,
    representatives: (supplier?.representatives ?? []) as RepFormData[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [repErrors, setRepErrors] = useState<Record<number, Record<string, string>>>({});

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const apiError = createMutation.error?.message || updateMutation.error?.message || null;

  useEffect(() => {
    if (supplier && mode === 'edit') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: supplier.name,
        contactName: supplier.contactName ?? '',
        email: supplier.email ?? '',
        phone: supplier.phone ?? '',
        address: supplier.address ?? '',
        leadTimeDays: supplier.leadTimeDays ?? 7,
        paymentTerms: supplier.paymentTerms ?? 'Net 30',
        performanceRating: supplier.performanceRating ?? 5,
        representatives: (supplier.representatives ?? []) as unknown as RepFormData[],
      });
    }
  }, [supplier, mode]);

  // ─── Representative management ── */

  const handleRepChange = (index: number, field: keyof RepFormData, value: string) => {
    setFormData((prev) => {
      const reps = [...(prev.representatives ?? [])];
      reps[index] = { ...reps[index], [field]: value };
      return { ...prev, representatives: reps };
    });
    // Clear error for this field
    if (repErrors[index]?.[field as string]) {
      setRepErrors((prev) => {
        const updated = { ...prev[index] };
        delete updated[field as string];
        return { ...prev, [index]: updated };
      });
    }
  };

  const addRepresentative = () => {
    setFormData((prev) => ({
      ...prev,
      representatives: [
        ...(prev.representatives ?? []),
        {
          name: '',
          email: '',
          phone: '',
          whatsappNumber: '',
          designation: '',
          address: '',
          notes: '',
        },
      ],
    }));
  };

  const removeRepresentative = (index: number) => {
    setFormData((prev) => {
      const reps = [...(prev.representatives ?? [])];
      reps.splice(index, 1);
      // Shift rep error indices to match new array order
      const newRepErrors: Record<number, Record<string, string>> = {};
      Object.keys(repErrors).forEach((k) => {
        const idx = Number(k);
        if (idx > index) {
          newRepErrors[idx - 1] = repErrors[idx];
        } else if (idx < index) {
          newRepErrors[idx] = repErrors[idx];
        }
      });
      setRepErrors(newRepErrors);
      return { ...prev, representatives: reps };
    });
  };

  // ─── Form submission ── */

  const validate = (): boolean => {
    try {
      supplierSchema.parse(formData);
      setErrors({});
      setRepErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        const newRepErrors: Record<number, Record<string, string>> = {};
        error.issues.forEach((issue) => {
          const path = issue.path as (string | number)[];
          if (path.length === 0) {
            // Schema-level error
            fieldErrors['__form__'] = issue.message;
          } else if (path[0] === 'representatives' && path.length >= 3) {
            const idx = Number(path[1]);
            const field = String(path[2]);
            if (!newRepErrors[idx]) newRepErrors[idx] = {};
            newRepErrors[idx][field] = issue.message;
          } else {
            const field = String(path[0]);
            fieldErrors[field] = issue.message;
          }
        });
        setErrors(fieldErrors);
        setRepErrors(newRepErrors);
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
        router.push('/suppliers');
        router.refresh();
      } else if (mode === 'edit' && supplier) {
        await updateMutation.mutateAsync({ id: supplier.id, data: formData });
        router.push(`/suppliers/${supplier.id}`);
        router.refresh();
      }
    } catch {
      // Error is surfaced via mutation error state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="rounded-lg bg-error/10 border border-error/30 p-3 text-body-sm text-error">
          {apiError}
        </div>
      )}

      {errors.__form__ && (
        <div className="rounded-lg bg-error/10 border border-error/30 p-3 text-body-sm text-error">
          {errors.__form__}
        </div>
      )}

      {Object.keys(repErrors).length > 0 && (
        <div className="rounded-lg bg-error/10 border border-error/30 p-3 text-body-sm text-error">
          Please fix the highlighted fields in the Representatives section.
        </div>
      )}

      {/* ── Supplier Details ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-body-md text-foreground">
            Supplier Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., PharmaMed Industries"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName" className="text-body-md text-foreground">
            Contact Person
          </Label>
          <Input
            id="contactName"
            type="text"
            placeholder="e.g., John Smith"
            value={formData.contactName ?? ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-body-md text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="supplier@example.com"
            value={formData.email ?? ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-body-md text-foreground">
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone ?? ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        <div className="lg:col-span-2 space-y-2">
          <Label htmlFor="address" className="text-body-md text-foreground">
            Address
          </Label>
          <Textarea
            id="address"
            placeholder="Supplier address..."
            value={formData.address ?? ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="leadTimeDays" className="text-body-md text-foreground">
            Lead Time (days)
          </Label>
          <Input
            id="leadTimeDays"
            type="number"
            min="1"
            value={formData.leadTimeDays ?? 7}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                leadTimeDays: parseInt(e.target.value, 10) || 7,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentTerms" className="text-body-md text-foreground">
            Payment Terms
          </Label>
          <Input
            id="paymentTerms"
            type="text"
            placeholder="e.g., Net 30, COD"
            value={formData.paymentTerms ?? 'Net 30'}
            onChange={(e) => setFormData((prev) => ({ ...prev, paymentTerms: e.target.value }))}
          />
        </div>
      </div>

      {/* ── Performance Rating ── */}
      <div className="space-y-2">
        <Label htmlFor="performanceRating" className="text-body-md text-foreground">
          Performance Rating (0–5)
        </Label>
        <Input
          id="performanceRating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={formData.performanceRating ?? 5}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              performanceRating: parseFloat(e.target.value) || 5,
            }))
          }
        />
      </div>

      {/* ── Representatives ── */}
      <Card className="border border-border bg-card card-elevated">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-md text-foreground">Representatives</h3>
            <Button type="button" variant="outline" size="sm" onClick={addRepresentative}>
              <Plus className="mr-2 h-4 w-4" />
              Add Representative
            </Button>
          </div>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Medical promotion officers and sales representatives for this supplier.
          </p>
        </div>

        <div className="p-4">
          {(formData.representatives ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-on-surface-variant">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-body-md">No representatives added yet.</p>
              <Button type="button" variant="outline" size="sm" onClick={addRepresentative}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Representative
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name *</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.representatives ?? []).map((rep, index) => (
                    <TableRow key={rep.id ?? `rep-${index}`}>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="Full name"
                          value={rep.name ?? ''}
                          onChange={(e) => handleRepChange(index, 'name', e.target.value)}
                          className={cn(
                            'h-8 text-sm',
                            repErrors[index]?.name ? 'border-destructive' : ''
                          )}
                        />
                        {repErrors[index]?.name && (
                          <p className="mt-1 text-xs text-destructive">{repErrors[index].name}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={rep.email ?? ''}
                          onChange={(e) => handleRepChange(index, 'email', e.target.value)}
                          className={cn(
                            'h-8 text-sm',
                            repErrors[index]?.email ? 'border-destructive' : ''
                          )}
                        />
                        {repErrors[index]?.email && (
                          <p className="mt-1 text-xs text-destructive">{repErrors[index].email}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="tel"
                          placeholder="+1 (555) ..."
                          value={rep.phone ?? ''}
                          onChange={(e) => handleRepChange(index, 'phone', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="tel"
                          placeholder="+1 (555) ..."
                          value={rep.whatsappNumber ?? ''}
                          onChange={(e) => handleRepChange(index, 'whatsappNumber', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="e.g., MPO, Sales Rep"
                          value={rep.designation ?? ''}
                          onChange={(e) => handleRepChange(index, 'designation', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeRepresentative(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Extended details for each representative (address, notes) */}
          {(formData.representatives ?? []).map((rep, index) =>
            rep.address || rep.notes ? (
              <div
                key={`details-${index}`}
                className="mt-3 rounded-lg border border-border bg-muted/20 p-3 space-y-2"
              >
                {rep.address && (
                  <div className="space-y-1">
                    <Label className="text-label-sm text-on-surface-variant">Address</Label>
                    <Textarea
                      value={rep.address}
                      onChange={(e) => handleRepChange(index, 'address', e.target.value)}
                      className="min-h-[60px] text-sm"
                      placeholder="Representative address..."
                    />
                  </div>
                )}
                {rep.notes && (
                  <div className="space-y-1">
                    <Label className="text-label-sm text-on-surface-variant">Notes</Label>
                    <Textarea
                      value={rep.notes}
                      onChange={(e) => handleRepChange(index, 'notes', e.target.value)}
                      className="min-h-[60px] text-sm"
                      placeholder="Notes..."
                    />
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>
      </Card>

      {/* ── Form Actions ── */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href={mode === 'edit' && supplier ? `/suppliers/${supplier.id}` : '/suppliers'}>
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
              {mode === 'create' ? 'Create Supplier' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
