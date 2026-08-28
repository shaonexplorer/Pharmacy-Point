/**
 * Route aggregator — mounts all module routers under their API prefixes.
 * Import this single router in app.ts instead of individual route files.
 */
import { Router } from 'express';
import { productRouter } from '../modules/products/product.routes';
import { companyRouter } from '../modules/companies/company.routes';
import { customerRouter } from '../modules/customers/customer.routes';
import { inventoryRouter } from '../modules/inventory/inventory.routes';
import { orderRouter } from '../modules/orders/order.routes';
import { statsRouter } from '../modules/stats/stats.routes';
import { categoryRouter } from '../modules/categories/category.routes';

const router = Router();

router.use('/products', productRouter);
router.use('/companies', companyRouter);
router.use('/customers', customerRouter);
router.use('/inventory', inventoryRouter);
router.use('/orders', orderRouter);
router.use('/stats', statsRouter);
router.use('/categories', categoryRouter);

export { router as apiRouter };
