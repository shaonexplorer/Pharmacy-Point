/**
 * Purchase order service — business logic for PO creation, approval, and receipt.
 *
 * Enhancements over the original minimal stub:
 *  - Auto-generates poNumber (format: PO-{YYYYMM}-{NNN})
 *  - Validates supplier and representative exist
 *  - Validates all products exist and are not soft-deleted
 *  - Defaults unitPrice to product's current price when omitted
 *  - Calculates totalAmount from line items
 *  - Links supplierRepresentativeId and createdById
 *  - Returns full PO with items (including product lite and representative)
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { parsePagination, buildPagination } from '../../utils/pagination';
import {
  serializePurchaseOrder,
  serializePurchaseOrderItem,
  serializeSupplier,
  serializeSupplierRepresentative,
} from '../../utils/serializers';
import type { POInput } from './purchase-order.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaResult = any;

export interface POListParams {
  page?: string | undefined;
  limit?: string | undefined;
  status?: string;
  supplierId?: string;
}

/**
 * List purchase orders with pagination, optional status and supplier filters.
 */
export async function listPOs(params: POListParams): Promise<{
  data: PrismaResult[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}> {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.supplierId) where.supplierId = params.supplierId;

  const [orders, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        supplierRepresentative: true,
        items: { include: { product: true } },
      },
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  const serialized = orders.map((po) => serializePurchaseOrder(po));

  return {
    data: serialized,
    pagination: { ...buildPagination(total, page, limit), total },
  };
}

/**
 * Fetch a single purchase order with full relations.
 * Throws 404 if not found.
 */
export async function getPO(id: string): Promise<PrismaResult> {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      supplierRepresentative: true,
      items: { include: { product: true } },
    },
  });

  if (!po) {
    throw new AppError(404, 'Purchase order not found');
  }

  return serializePurchaseOrder(po);
}

/**
 * Auto-generate a unique PO number: PO-{YYYYMM}-{NNN}
 * The sequence is per-month, zero-padded to 3 digits.
 */
async function generatePoNumber(): Promise<string> {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `PO-${yearMonth}-`;

  const latest = await prisma.purchaseOrder.findFirst({
    where: { poNumber: { startsWith: prefix } },
    orderBy: { poNumber: 'desc' },
    select: { poNumber: true },
  });

  let seq = 1;
  if (latest) {
    const lastNum = parseInt(latest.poNumber.slice(prefix.length), 10);
    seq = lastNum + 1;
  }

  return `${prefix}${String(seq).padStart(3, '0')}`;
}

/**
 * Create a new purchase order.
 *
 * Validates:
 *  - Supplier exists
 *  - Supplier representative (if provided) belongs to the supplier
 *  - All products exist and are not soft-deleted
 *
 * Defaults:
 *  - poNumber (auto-generated)
 *  - unitPrice (product's current price when omitted)
 *  - totalAmount (calculated from line items)
 *  - status: PENDING
 */
export async function createPO(data: POInput): Promise<PrismaResult> {
  const {
    supplierId,
    supplierRepresentativeId,
    expectedDeliveryDate,
    notes,
    createdById,
    items,
  } = data;

  // ── Validate supplier exists ──
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { id: true },
  });
  if (!supplier) {
    throw new AppError(404, 'Supplier not found');
  }

  // ── Validate representative belongs to supplier ──
  if (supplierRepresentativeId) {
    const rep = await prisma.supplierRepresentative.findFirst({
      where: { id: supplierRepresentativeId, supplierId },
      select: { id: true },
    });
    if (!rep) {
      throw new AppError(
        404,
        'Representative not found for this supplier'
      );
    }
  }

  // ── Validate products exist and are not soft-deleted ──
  const productIds = items
    .filter((item) => item.productId)
    .map((item) => item.productId as string);

  const products =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds }, deletedAt: null },
          select: { id: true, name: true, sku: true, price: true },
        })
      : [];

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    if (item.productId && !productMap.has(item.productId)) {
      throw new AppError(
        404,
        `Product not found: ${item.productId}`
      );
    }
  }

  // ── Create PO with auto-generated number and calculated total ──
  const poNumber = data.poNumber ?? (await generatePoNumber());

  const totalAmount = items.reduce((sum, item) => {
    const price =
      item.unitPrice ??
      (item.productId ? Number(productMap.get(item.productId)?.price ?? 0) : 0);
    return sum + price * item.quantity;
  }, 0);

  const po = await prisma.purchaseOrder.create({
    data: {
      supplierId,
      supplierRepresentativeId: supplierRepresentativeId ?? undefined,
      poNumber,
      totalAmount,
      notes: notes ?? undefined,
      expectedDeliveryDate: expectedDeliveryDate ?? undefined,
      createdById: createdById ?? undefined,
      items: {
        create: items.map((item) => ({
          productId: item.productId ?? undefined,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? Number(productMap.get(item.productId!)?.price ?? 0),
          receivedQty: 0,
          notes: item.notes ?? undefined,
        })),
      },
    },
    include: {
      supplier: true,
      supplierRepresentative: true,
      items: { include: { product: true } },
    },
  });

  return serializePurchaseOrder(po);
}

/**
 * Update PO status to APPROVED.
 */
export async function approvePO(id: string, approvedBy?: string): Promise<PrismaResult> {
  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedBy: approvedBy ?? undefined,
      approvedAt: new Date(),
    },
    include: {
      supplier: true,
      supplierRepresentative: true,
      items: { include: { product: true } },
    },
  });

  return serializePurchaseOrder(po);
}

/**
 * Receive a purchase order — increments product stock for each item,
 * records the receivedQty, and updates PO status to RECEIVED.
 */
export async function receivePO(id: string): Promise<PrismaResult> {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!po) throw new AppError(404, 'Purchase order not found');

  await prisma.$transaction(async (tx) => {
    for (const item of po.items) {
      if (item.productId) {
        const receivedQty = item.quantity - item.receivedQty;
        if (receivedQty > 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { increment: receivedQty } },
          });
          await tx.purchaseOrderItem.update({
            where: { id: item.id },
            data: { receivedQty: item.quantity },
          });
        }
      }
    }
    await tx.purchaseOrder.update({
      where: { id },
      data: { status: 'RECEIVED' },
    });
  });

  return getPO(id);
}

/**
 * Cancel a purchase order — only allowed in PENDING status.
 */
export async function cancelPO(id: string, notes?: string): Promise<PrismaResult> {
  const po = await prisma.purchaseOrder.findUnique({ where: { id } });
  if (!po) throw new AppError(404, 'Purchase order not found');
  if (po.status !== 'PENDING') {
    throw new AppError(400, `Cannot cancel PO in ${po.status} status`);
  }

  const updated = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      notes: notes ? `${po.notes ?? ''}\n${notes}`.trim() : po.notes,
    },
    include: {
      supplier: true,
      supplierRepresentative: true,
      items: { include: { product: true } },
    },
  });

  return serializePurchaseOrder(updated);
}
