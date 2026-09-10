import { prisma } from '../../config/database';
export const listSuppliers = (q?: string) => prisma.supplier.findMany({
  where: q ? { name: { contains: q, mode: 'insensitive' } } : {},
  include: { purchaseOrders: { take: 5 } },
  orderBy: { name: 'asc' },
});
export const getSupplier = (id: string) => prisma.supplier.findUnique({ where: { id }, include: { purchaseOrders: true } });
export const createSupplier = (data: any) => prisma.supplier.create({ data });
export const updateSupplier = (id: string, data: any) => prisma.supplier.update({ where: { id }, data });
export const deleteSupplier = (id: string) => prisma.supplier.delete({ where: { id } });
