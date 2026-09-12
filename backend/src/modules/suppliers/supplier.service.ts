/**
 * Supplier service — business logic for supplier and representative CRUD.
 *
 * Each supplier can have multiple SupplierRepresentative records (medical
 * promotion officers / sales representatives).  Representatives are managed as
 * a nested create/update/delete within the supplier transaction so the
 * aggregate stays consistent.
 */
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { parsePagination, buildPagination } from '../../utils/pagination';
import { serializeSupplier } from '../../utils/serializers';
import type { SupplierInput } from './supplier.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaResult = any;

export interface SupplierListParams {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string;
}

export interface PaginatedSuppliers {
  data: PrismaResult[];
  pagination: ReturnType<typeof buildPagination> & { total: number };
}

/**
 * List suppliers with pagination and optional search.
 * Representatives are always included in the result.
 */
export async function listSuppliers(params: SupplierListParams): Promise<PaginatedSuppliers> {
  const { page, limit, skip } = parsePagination({ page: params.page, limit: params.limit });
  const search = params.search ?? '';

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { contactName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      where,
      include: {
        representatives: { orderBy: { name: 'asc' } },
        _count: { select: { purchaseOrders: true, representatives: true } },
      },
    }),
    prisma.supplier.count({ where }),
  ]);

  const serialized = suppliers.map((s) => serializeSupplier(s));

  return {
    data: serialized,
    pagination: { ...buildPagination(total, page, limit), total },
  };
}

/**
 * Get a single supplier by ID, including representatives and recent purchase orders.
 * Throws 404 if not found.
 */
export async function getSupplier(id: string): Promise<PrismaResult> {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      representatives: { orderBy: { name: 'asc' } },
      purchaseOrders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { purchaseOrders: true, representatives: true } },
    },
  });

  if (!supplier) {
    throw new AppError(404, 'Supplier not found');
  }

  return serializeSupplier(supplier);
}

/**
 * Create a new supplier with optional nested representatives.
 */
export async function createSupplier(data: SupplierInput): Promise<PrismaResult> {
  const { representatives, ...supplierData } = data;

  const supplier = await prisma.supplier.create({
    data: {
      name: supplierData.name.trim(),
      contactName: supplierData.contactName?.trim() || null,
      email: supplierData.email?.trim() || null,
      phone: supplierData.phone?.trim() || null,
      address: supplierData.address?.trim() || null,
      leadTimeDays: supplierData.leadTimeDays ?? 7,
      paymentTerms: supplierData.paymentTerms ?? 'Net 30',
      performanceRating: supplierData.performanceRating ?? 5,
      ...(representatives && representatives.length > 0
        ? {
            representatives: {
              create: representatives.map((r) => ({
                name: r.name.trim(),
                email: r.email?.trim() || null,
                phone: r.phone?.trim() || null,
                whatsappNumber: r.whatsappNumber?.trim() || null,
                designation: r.designation?.trim() || null,
                address: r.address?.trim() || null,
                notes: r.notes?.trim() || null,
              })),
            },
          }
        : {}),
    },
    include: {
      representatives: { orderBy: { name: 'asc' } },
      _count: { select: { purchaseOrders: true, representatives: true } },
    },
  });

  return serializeSupplier(supplier);
}

/**
 * Update an existing supplier. Throws 404 if not found.
 *
 * Representative handling:
 *  - Existing representatives not in the incoming array are deleted.
 *  - Representatives with an `id` are updated; those without are created.
 */
export async function updateSupplier(id: string, data: SupplierInput): Promise<PrismaResult> {
  const { representatives, ...supplierData } = data;

  // Verify the supplier exists
  const existing = await prisma.supplier.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Supplier not found');
  }

  // Normalize representative payloads
  const normalizedReps = (representatives ?? []).map((r: any) => ({
    ...(r.id ? { id: r.id } : {}),
    name: (r.name ?? '').trim(),
    email: r.email?.trim() || null,
    phone: r.phone?.trim() || null,
    whatsappNumber: r.whatsappNumber?.trim() || null,
    designation: r.designation?.trim() || null,
    address: r.address?.trim() || null,
    notes: r.notes?.trim() || null,
  }));

  // Determine which existing reps to keep vs delete
  const incomingIds = new Set(normalizedReps.filter((r) => r.id).map((r) => r.id));
  const repsToDelete = await prisma.supplierRepresentative.findMany({
    where: { supplierId: id },
  });
  const idsToDelete = repsToDelete
    .filter((r) => !incomingIds.has(r.id))
    .map((r) => r.id);

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      name: supplierData.name ? supplierData.name.trim() : undefined,
      contactName: supplierData.contactName
        ? supplierData.contactName.trim()
        : existing.contactName,
      email: supplierData.email ? supplierData.email.trim() : existing.email,
      phone: supplierData.phone ? supplierData.phone.trim() : existing.phone,
      address: supplierData.address
        ? supplierData.address.trim()
        : existing.address,
      leadTimeDays: supplierData.leadTimeDays ?? existing.leadTimeDays,
      paymentTerms: supplierData.paymentTerms ?? existing.paymentTerms,
      performanceRating: supplierData.performanceRating ?? existing.performanceRating,
      representatives: {
        ...(idsToDelete.length > 0 ? { delete: idsToDelete.map((rid) => ({ id: rid })) } : {}),
        ...(normalizedReps.length > 0
          ? {
              upsert: normalizedReps.map((r) => ({
                where: { id: r.id ?? '__new__' },
                create: r,
                update: r,
              })),
            }
          : {}),
      },
    },
    include: {
      representatives: { orderBy: { name: 'asc' } },
      _count: { select: { purchaseOrders: true, representatives: true } },
    },
  });

  return serializeSupplier(supplier);
}

/**
 * Delete a supplier. Throws 404 if not found; 400 if purchase orders exist.
 */
export async function deleteSupplier(id: string): Promise<void> {
  const poCount = await prisma.purchaseOrder.count({ where: { supplierId: id } });
  if (poCount > 0) {
    throw new AppError(400, 'Cannot delete supplier with purchase orders');
  }

  try {
    await prisma.supplier.delete({ where: { id } });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      throw new AppError(404, 'Supplier not found');
    }
    throw error;
  }
}

/**
 * ─── Representative Management ───────────────────────────────────────
 */

/**
 * List all representatives for a supplier.
 */
export async function listRepresentatives(supplierId: string): Promise<PrismaResult[]> {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { id: true },
  });
  if (!supplier) {
    throw new AppError(404, 'Supplier not found');
  }

  return prisma.supplierRepresentative.findMany({
    where: { supplierId },
    orderBy: { name: 'asc' },
  });
}

/**
 * Get a single representative by ID.
 */
export async function getRepresentative(id: string): Promise<PrismaResult> {
  const rep = await prisma.supplierRepresentative.findUnique({
    where: { id },
    include: { supplier: true },
  });
  if (!rep) {
    throw new AppError(404, 'Representative not found');
  }
  return rep;
}

/**
 * Create a new representative for a supplier.
 */
export async function createRepresentative(
  supplierId: string,
  data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    whatsappNumber?: string | null;
    designation?: string | null;
    address?: string | null;
    notes?: string | null;
  }
): Promise<PrismaResult> {
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { id: true },
  });
  if (!supplier) {
    throw new AppError(404, 'Supplier not found');
  }

  return prisma.supplierRepresentative.create({
    data: {
      supplierId,
      name: data.name.trim(),
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      whatsappNumber: data.whatsappNumber?.trim() || null,
      designation: data.designation?.trim() || null,
      address: data.address?.trim() || null,
      notes: data.notes?.trim() || null,
    },
  });
}

/**
 * Update a representative.
 */
export async function updateRepresentative(
  id: string,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    whatsappNumber?: string | null;
    designation?: string | null;
    address?: string | null;
    notes?: string | null;
  }
): Promise<PrismaResult> {
  try {
    return await prisma.supplierRepresentative.update({
      where: { id },
      data: {
        name: data.name ? data.name.trim() : undefined,
        email: data.email !== undefined ? data.email?.trim() || null : undefined,
        phone: data.phone !== undefined ? data.phone?.trim() || null : undefined,
        whatsappNumber:
          data.whatsappNumber !== undefined
            ? data.whatsappNumber?.trim() || null
            : undefined,
        designation:
          data.designation !== undefined
            ? data.designation?.trim() || null
            : undefined,
        address: data.address !== undefined ? data.address?.trim() || null : undefined,
        notes: data.notes !== undefined ? data.notes?.trim() || null : undefined,
      },
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      throw new AppError(404, 'Representative not found');
    }
    throw error;
  }
}

/**
 * Delete a representative.
 */
export async function deleteRepresentative(id: string): Promise<void> {
  try {
    await prisma.supplierRepresentative.delete({ where: { id } });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      throw new AppError(404, 'Representative not found');
    }
    throw error;
  }
}
