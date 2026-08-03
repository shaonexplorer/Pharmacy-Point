import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /api/companies
 * List all companies with pagination and optional search.
 * Query params: page, limit, search
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('Starting companies query...');

    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const search = (req.query.search as string) || '';

    const skip = (page - 1) * limit;

    const companies = await prisma.company.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {},
    });

    const total = await prisma.company.count({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {},
    });

    console.log('Companies query successful, found:', companies.length);
    return res.json({
      data: companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching companies:', err.stack || err.message || error);
    return res.status(500).json({ error: 'Failed to fetch companies', details: err.message });
  }
});

/**
 * GET /api/companies/:id
 * Get a single company by ID with products.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        products: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json({ data: company });
  } catch (error: any) {
    console.error('Error fetching company:', error);
    return res.status(500).json({ error: 'Failed to fetch company', details: error.message });
  }
});

/**
 * POST /api/companies
 * Create a new company.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      name: string;
      description?: string;
      image?: string;
    };

    if (!body.name || body.name.trim().length === 0) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const company = await prisma.company.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim(),
        image: body.image?.trim(),
      },
    });

    return res.status(201).json({ data: company, message: 'Company created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Company with this name already exists' });
    }
    console.error('Error creating company:', error);
    return res.status(500).json({ error: 'Failed to create company', details: error.message });
  }
});

/**
 * PUT /api/companies/:id
 * Update an existing company.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body as {
      name?: string;
      description?: string;
      image?: string;
    };

    if (!body.name || body.name.trim().length === 0) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name: body.name.trim(),
        description: body.description?.trim(),
        image: body.image?.trim(),
      },
    });

    return res.json({ data: company, message: 'Company updated successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Company with this name already exists' });
    }
    console.error('Error updating company:', error);
    return res.status(500).json({ error: 'Failed to update company', details: error.message });
  }
});

/**
 * DELETE /api/companies/:id
 * Delete a company.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if company has products first
    const productCount = await prisma.product.count({
      where: { companyId: id },
    });

    if (productCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete company with products',
        details: 'Remove all products from this company before deleting',
      });
    }

    await prisma.company.delete({
      where: { id },
    });

    return res.json({ message: 'Company deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Company not found' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Cannot delete company with related products',
        details: 'Remove all products from this company before deleting',
      });
    }
    console.error('Error deleting company:', error);
    return res.status(500).json({ error: 'Failed to delete company', details: error.message });
  }
});

export const companyRouter = router;
