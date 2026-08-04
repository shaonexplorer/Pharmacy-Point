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
import { Select } from '@/components/ui/select';
import { Loader2, Save, X, Trash2 } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/lib/formatters';
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
      {apiError && (
        <div className="rounded-lg bg-error/10 border border-error/30 p-3 text-body-sm text-error">
          {apiError}
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
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
            className={errors.sku ? 'border-destructive' : ''}
          />
          {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
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
            className={errors.price ? 'border-destructive' : ''}
          />
          {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-body-md text-foreground">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            id="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={errors.category ? 'border-destructive' : ''}
          >
            <option value="">Select a category</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="companyId" className="text-body-md text-foreground">
            Company
          </Label>
          <Select
            id="companyId"
            value={formData.companyId ?? ''}
            onChange={(e) => handleChange('companyId', e.target.value || '')}
            className={errors.companyId ? 'border-destructive' : ''}
          >
            <option value="">Select a company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
          {errors.companyId && <p className="text-sm text-destructive">{errors.companyId}</p>}
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
            className={errors.quantity ? 'border-destructive' : ''}
          />
          {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
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
            className={errors.lowStock ? 'border-destructive' : ''}
          />
          {errors.lowStock && <p className="text-sm text-destructive">{errors.lowStock}</p>}
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
            className={errors.image ? 'border-destructive' : ''}
          />
          {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
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
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
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
        <Button type="submit" disabled={isSubmitting}>
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
