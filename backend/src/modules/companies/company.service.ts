/**
 * Company service — business logic for company CRUD.
 * Extracted from inline route handlers in companies.ts.
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { parsePagination, buildPagination } from '../../utils/pagination';
import type { CompanyCreateInput, CompanyUpdateInput } from './company.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaResult = any;

export interface CompanyListParams {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string;
}

export interface PaginatedCompanies {
  data: PrismaResult[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}

/**
 * List companies with pagination and optional search.
 */
export async function listCompanies(params: CompanyListParams): Promise<PaginatedCompanies> {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });
  const search = params.search ?? '';

  const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {};

  const [companies, total] = await Promise.all([
    prisma.company.findMany({ skip, take: limit, orderBy: { name: 'asc' }, where }),
    prisma.company.count({ where }),
  ]);

  return {
    data: companies,
    pagination: { ...buildPagination(total, page, limit), total },
  };
}

/**
 * Get a single company by ID with products.
 * Throws 404 if not found.
 */
export async function getCompany(id: string): Promise<PrismaResult> {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      products: {
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!company) {
    throw new AppError(404, 'Company not found');
  }

  return company;
}

/**
 * Create a new company.
 */
export async function createCompany(data: CompanyCreateInput): Promise<PrismaResult> {
  const company = await prisma.company.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim(),
      image: data.image?.trim(),
    },
  });

  return company;
}

/**
 * Update an existing company. Throws 404 if not found; 409 on duplicate name.
 */
export async function updateCompany(id: string, data: CompanyUpdateInput): Promise<PrismaResult> {
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Company not found');
  }

  try {
    const company = await prisma.company.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : existing.name,
        description:
          data.description !== undefined ? data.description?.trim() : existing.description,
        image: data.image !== undefined ? data.image?.trim() : existing.image,
      },
    });

    return company;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      throw new AppError(404, 'Company not found');
    }
    throw error;
  }
}

/**
 * Delete a company. Throws 400 if the company has products; 404 if not found.
 */
export async function deleteCompany(id: string): Promise<void> {
  const productCount = await prisma.product.count({ where: { companyId: id } });

  if (productCount > 0) {
    throw new AppError(400, 'Cannot delete company with products');
  }

  try {
    await prisma.company.delete({ where: { id } });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      throw new AppError(404, 'Company not found');
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      throw new AppError(400, 'Cannot delete company with related products');
    }
    throw error;
  }
}
