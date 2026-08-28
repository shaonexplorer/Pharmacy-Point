/**
 * Category controller — HTTP request handlers.
 * Delegates business logic to categoryService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import * as categoryService from './category.service';

/**
 * GET /api/categories
 * List all categories ordered by name ascending.
 */
export const list = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.listCategories();
  res.json({ data: categories });
});

/**
 * POST /api/categories
 * Create a new category (admin only).
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({ data: category, message: 'Category created successfully' });
});
