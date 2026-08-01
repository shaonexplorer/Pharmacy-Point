import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /api/categories
 * List all categories.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return res.json({ data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * POST /api/categories
 * Create a new category (admin only).
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: categorySlug,
        description: description ?? undefined,
      },
    });

    return res.status(201).json({ data: category, message: 'Category created successfully' });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ error: 'Category name or slug already exists' });
    }
    console.error('Error creating category:', error);
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

export default router;
