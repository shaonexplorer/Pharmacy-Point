import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

/**
 * GET /api/companies
 * List all active companies.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return res.json({ data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

/**
 * GET /api/companies/:id
 * Get a single company by ID.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json({ data: company });
  } catch (error) {
    console.error('Error fetching company:', error);
    return res.status(500).json({ error: 'Failed to fetch company' });
  }
});

/**
 * POST /api/companies
 * Create a new company.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        email: email?.trim() ?? undefined,
        phone: phone?.trim() ?? undefined,
        address: address?.trim() ?? undefined,
        description: description?.trim() ?? undefined,
      },
    });

    return res
      .status(201)
      .json({ data: company, message: 'Company created successfully' });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ error: 'Company with this email or name already exists' });
    }
    console.error('Error creating company:', error);
    return res.status(500).json({ error: 'Failed to create company' });
  }
});

/**
 * PUT /api/companies/:id
 * Update an existing company.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, description, isActive } = req.body;

    const existing = await prisma.company.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        email: email ? email.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        address: address ? address.trim() : undefined,
        description: description ? description.trim() : undefined,
        isActive: isActive,
      },
    });

    return res.json({ data: company, message: 'Company updated successfully' });
  } catch (error) {
    console.error('Error updating company:', error);
    return res.status(500).json({ error: 'Failed to update company' });
  }
});

/**
 * DELETE /api/companies/:id
 * Soft delete a company (deactivates it).
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.company.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Company not found' });
    }

    await prisma.company.update({
      where: { id },
      data: { isActive: false },
    });

    return res.json({ message: 'Company deactivated successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return res.status(500).json({ error: 'Failed to delete company' });
  }
});

export default router;