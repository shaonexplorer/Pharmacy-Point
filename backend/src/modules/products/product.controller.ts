/**
 * Product controller — HTTP request handlers.
 * Delegates business logic to productService; handles request/response.
 */
import type { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { serializeProduct } from '../../utils/serializers';
import * as productService from './product.service';

/**
 * GET /api/products
 * List products with pagination, search, and category filter.
 * Query params: page, limit, search, category, companyId
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.listProducts({
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
    search: (req.query.search as string) || '',
    category: (req.query.category as string) || '',
    companyId: (req.query.companyId as string) || undefined,
  });

  res.json({
    data: result.data.map((p: Record<string, unknown>) => serializeProduct(p)),
    pagination: result.pagination,
  });
});

/**
 * GET /api/products/:id
 * Get a single product by ID.
 */
export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProduct(req.params.id);
  res.json({ data: serializeProduct(product) });
});

/**
 * POST /api/products
 * Create a new product.
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res
    .status(201)
    .json({ data: serializeProduct(product), message: 'Product created successfully' });
});

/**
 * PUT /api/products/:id
 * Update an existing product.
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ data: serializeProduct(product), message: 'Product updated successfully' });
});

/**
 * DELETE /api/products/:id
 * Soft-delete a product.
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  res.json({ message: 'Product deleted successfully' });
});
