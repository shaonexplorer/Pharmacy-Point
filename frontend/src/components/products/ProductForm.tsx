'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Product } from '@pharmacy-point/types';
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useCompanies } from '@/hooks/useCompanies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, X, Trash2 } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Zod schema for product validation
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
  lowStock: z.number().int().min(0, 'Low stock threshold must be 0 or greater').optional(),
  companyId: z.string().optional().nullable(),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  mode: 'create' | 'edit';
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useCompanies();
  const companies = companiesResponse?.data ?? [];

  const [formData, setFormData] = useState<FormData>({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    price: product?.price ?? 0,
    quantity: product?.quantity ?? 0,
    lowStock: product?.lowStock ?? 10,
    companyId: product?.companyId ?? null,
    description: product?.description ?? '',
    image: product?.image ?? '',
    category: product?.category ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const apiError =
    createMutation.error?.message ||
    updateMutation.error?.message ||
    deleteMutation.error?.message ||
    null;

  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price,
        category: product.category,
        quantity: product.quantity,
        lowStock: product.lowStock,
        companyId: product.companyId ?? null,
        description: product.description ?? '',
        image: product.image ?? '',
      });
    }
  }, [product]);

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
      productSchema.parse(formData);
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
        router.push('/products');
        router.refresh();
      } else if (mode === 'edit' && product) {
        await updateMutation.mutateAsync({ id: product.id, data: formData });
        router.push(`/products/${product.id}`);
        router.refresh();
      }
    } catch {
      // Error is surfaced via mutation error state
    }
  };

  const handleDelete = async () => {
    if (!product || !window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(product.id);
      router.push('/products');
      router.refresh();
    } catch {
      // Error is surfaced via mutation error state
    }
  };

  if (isLoadingCompanies) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {(apiError || Object.keys(errors).length > 0) && (
        <div className="rounded-lg border border-error bg-error/5 p-4 card-elevated">
          <div className="flex items-center gap-2 text-error">
            <X className="h-4 w-4" />
            <div className="space-y-1">
              {apiError && <p className="text-body-md">{apiError}</p>}
              {Object.entries(errors).map(([field, message]) => (
                <p key={field} className="text-body-sm">
                  {field}: {message}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-body-md text-foreground">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g., Paracetamol 500mg"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={cn(
              'transition-all duration-200',
              errors.name && 'border-error focus:ring-error/50'
            )}
          />
          {errors.name && <p className="text-sm text-error">{errors.name}</p>}
        </div>

        {/* SKU */}
        <div className="space-y-2">
          <Label htmlFor="sku" className="text-body-md text-foreground">
            SKU <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sku"
            type="text"
            placeholder="e.g., PARA-500-001"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            className={cn(
              'font-mono text-sm',
              'transition-all duration-200',
              errors.sku && 'border-error focus:ring-error/50'
            )}
          />
          {errors.sku && <p className="text-sm text-error">{errors.sku}</p>}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-body-md text-foreground">
            Price <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            className={cn(
              'font-mono text-lg',
              'transition-all duration-200',
              errors.price && 'border-error focus:ring-error/50'
            )}
          />
          {errors.price && <p className="text-sm text-error">{errors.price}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-body-md text-foreground">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.category} onValueChange={(val) => handleChange('category', val)}>
            <SelectTrigger
              id="category"
              className={cn(
                'transition-all duration-200',
                errors.category && 'border-error focus:ring-error/50'
              )}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select a category</SelectItem>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-error">{errors.category}</p>}
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="companyId" className="text-body-md text-foreground">
            Company
          </Label>
          <Select
            value={formData.companyId ?? undefined}
            onValueChange={(val) => handleChange('companyId', val || '')}
          >
            <SelectTrigger
              id="companyId"
              className={cn(
                'transition-all duration-200',
                errors.companyId && 'border-error focus:ring-error/50'
              )}
            >
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select a company</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companyId && <p className="text-sm text-error">{errors.companyId}</p>}
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-body-md text-foreground">
            Stock Quantity <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            placeholder="0"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
            className={cn(
              'font-mono',
              'transition-all duration-200',
              errors.quantity && 'border-error focus:ring-error/50'
            )}
          />
          {errors.quantity && <p className="text-sm text-error">{errors.quantity}</p>}
        </div>

        {/* Low Stock Threshold */}
        <div className="space-y-2">
          <Label htmlFor="lowStock" className="text-body-md text-foreground">
            Low Stock Threshold <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lowStock"
            type="number"
            placeholder="10"
            min="0"
            value={formData.lowStock ?? 10}
            onChange={(e) => handleChange('lowStock', parseInt(e.target.value) || 0)}
            className={cn(
              'font-mono',
              'transition-all duration-200',
              errors.lowStock && 'border-error focus:ring-error/50'
            )}
          />
          {errors.lowStock && <p className="text-sm text-error">{errors.lowStock}</p>}
        </div>

        {/* Image URL */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="image" className="text-body-md text-foreground">
            Image URL
          </Label>
          <Input
            id="image"
            type="url"
            placeholder="https://example.com/image.png"
            value={formData.image}
            onChange={(e) => handleChange('image', e.target.value)}
            className={cn(
              'transition-all duration-200',
              errors.image && 'border-error focus:ring-error/50'
            )}
          />
          {errors.image && <p className="text-sm text-error">{errors.image}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description" className="text-body-md text-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Enter product description..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={cn(
              'transition-all duration-200',
              errors.description && 'border-error focus:ring-error/50'
            )}
          />
          {errors.description && <p className="text-sm text-error">{errors.description}</p>}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <div className="flex gap-2">
          <Button asChild variant="outline" type="button">
            <Link href={mode === 'edit' && product ? `/products/${product.id}` : '/products'}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
          {mode === 'edit' && product && (
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={handleDelete}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} variant="default">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Create Product' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
