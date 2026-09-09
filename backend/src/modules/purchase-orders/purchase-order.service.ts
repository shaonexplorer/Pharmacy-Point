import { prisma } from '../../config/database';
export const listPOs = (status?: string) => prisma.purchaseOrder.findMany({
  where: status ? { status: status as any } : {}, include: { supplier: true, items: { include: { product: true } } }, orderBy: { createdAt: 'desc' },
});
export const getPO = (id: string) => prisma.purchaseOrder.findUnique({ where: { id }, include: { supplier: true, items: { include: { product: true } } } });
export const createPO = (data: any) => prisma.purchaseOrder.create({
  data: { ...data, items: { create: data.items } },
  include: { supplier: true, items: true },
});
export const approvePO = (id: string, approvedBy?: string) => prisma.purchaseOrder.update({ where: { id }, data: { status: 'APPROVED', approvedBy, approvedAt: new Date() } });
export const receivePO = async (id: string) => {
  const po = await prisma.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
  if (!po) throw new Error('PO not found');
  await prisma.$transaction(async (tx) => {
    for (const item of po.items) {
      if (item.productId) {
        await tx.product.update({ where: { id: item.productId }, data: { quantity: { increment: item.quantity - item.receivedQty } } });
      }
    }
    await tx.purchaseOrder.update({ where: { id }, data: { status: 'RECEIVED' } });
  });
  return getPO(id);
};
