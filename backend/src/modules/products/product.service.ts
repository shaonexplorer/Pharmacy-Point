/**
 * Product service — business logic for product CRUD.
 * Extracted from inline route handlers in products.ts.
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type { ProductCreateInput, ProductUpdateInput } from './product.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaResult = any;

export interface ProductListParams {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string;
  category?: string;
  companyId?: string;
}

export interface PaginatedProducts {
  data: PrismaResult[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}

/**
 * List products with pagination, search, and filters.
 * Excludes soft-deleted products.
 */
export async function listProducts(params: ProductListParams): Promise<PaginatedProducts> {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });
  const search = params.search ?? '';
  const category = params.category ?? '';
  const companyId = params.companyId;

  const where: Record<string, unknown> = { deletedAt: null };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (companyId) {
    where.companyId = companyId;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { company: true },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products,
    pagination: { ...buildPagination(total, page, limit), total },
  };
}

/**
 * Get a single product by ID. Throws 404 if not found or soft-deleted.
 */
export async function getProduct(id: string): Promise<PrismaResult> {
  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: { company: true },
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  return product;
}

/**
 * Create a new product. Throws 409 on duplicate SKU.
 */
export async function createProduct(data: ProductCreateInput): Promise<PrismaResult> {
  const existing = await prisma.product.findFirst({
    where: { sku: data.sku, deletedAt: null },
  });

  if (existing) {
    throw new AppError(409, 'SKU already exists');
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description ?? undefined,
      sku: data.sku,
      companyId: data.companyId ?? undefined,
      price: data.price,
      quantity: data.quantity ?? 0,
      lowStock: data.lowStock ?? 10,
      category: data.category,
      image: data.image ?? undefined,
    },
    include: { company: true },
  });

  return product;
}

/**
 * Update an existing product. Throws 404 if not found; 409 on duplicate SKU.
 */
export async function updateProduct(id: string, data: ProductUpdateInput): Promise<PrismaResult> {
  const existing = await prisma.product.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    throw new AppError(404, 'Product not found');
  }

  if (data.sku && data.sku !== existing.sku) {
    const skuTaken = await prisma.product.findFirst({
      where: { sku: data.sku, deletedAt: null, id: { not: id } },
    });

    if (skuTaken) {
      throw new AppError(409, 'SKU already exists');
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description ?? undefined,
      sku: data.sku,
      companyId: data.companyId ?? undefined,
      price: data.price,
      quantity: data.quantity,
      lowStock: data.lowStock,
      category: data.category,
      image: data.image ?? undefined,
    },
    include: { company: true },
  });

  return product;
}

/**
 * Soft-delete a product (set deletedAt timestamp).
 * Throws 404 if not found.
 */
export async function deleteProduct(id: string): Promise<void> {
  const existing = await prisma.product.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existing) {
    throw new AppError(404, 'Product not found');
  }

  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
