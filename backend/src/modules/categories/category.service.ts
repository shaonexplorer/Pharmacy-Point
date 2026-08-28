/**
 * Category service — business logic for category CRUD.
 * Extracted from inline route handlers in categories.ts.
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import type { CategoryCreateInput } from './category.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaResult = any;

/**
 * List all categories ordered by name ascending.
 */
export async function listCategories(): Promise<PrismaResult[]> {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

/**
 * Create a new category.
 * Auto-generates slug from name if not provided.
 * Throws 409 on duplicate name or slug.
 */
export async function createCategory(data: CategoryCreateInput): Promise<PrismaResult> {
  const categorySlug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  try {
    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug: categorySlug,
        description: data.description ?? undefined,
      },
    });

    return category;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new AppError(409, 'Category name or slug already exists');
    }
    throw error;
  }
}
