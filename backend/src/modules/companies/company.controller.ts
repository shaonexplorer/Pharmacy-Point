/**
 * Company controller — HTTP request handlers.
 * Delegates business logic to companyService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import * as companyService from './company.service';

/**
 * GET /api/companies
 * List all companies with pagination and optional search.
 * Query params: page, limit, search
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await companyService.listCompanies({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    search: (req.query.search as string) || '',
  });

  res.json({
    data: result.data,
    pagination: result.pagination,
  });
});

/**
 * GET /api/companies/:id
 * Get a single company by ID with products.
 */
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const company = await companyService.getCompany(req.params.id);
  res.json({ data: company });
});

/**
 * POST /api/companies
 * Create a new company.
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const company = await companyService.createCompany(req.body);
  res.status(201).json({ data: company, message: 'Company created successfully' });
});

/**
 * PUT /api/companies/:id
 * Update an existing company.
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const company = await companyService.updateCompany(req.params.id, req.body);
  res.json({ data: company, message: 'Company updated successfully' });
});

/**
 * DELETE /api/companies/:id
 * Delete a company.
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await companyService.deleteCompany(req.params.id);
  res.json({ message: 'Company deleted successfully' });
});
