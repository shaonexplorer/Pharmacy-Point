/**
 * Shared serialization helpers.
 *
 * Prisma returns Decimal objects and Date objects that do not serialize
 * cleanly to JSON. These helpers normalize those values to primitives.
 * Functions were previously duplicated across route files.
 */

/**
 * Serialize a Prisma Product row for API responses.
 */
export function serializeProduct(product: Record<string, unknown>): Record<string, unknown> {
  return {
    id: product.id as string,
    name: product.name as string,
    description: product.description as string | null,
    sku: product.sku as string,
    price: Number(product.price),
    quantity: product.quantity as number,
    lowStock: product.lowStock as number,
    category: product.category as string,
    companyId: product.companyId as string | null | undefined,
    company: product.company as Record<string, unknown> | null | undefined,
    image: product.image as string | null,
    deletedAt: product.deletedAt as Date | null,
    createdAt: product.createdAt as Date,
    updatedAt: product.updatedAt as Date,
  };
}

/**
 * Serialize a Prisma Product row for inventory listing (adds isLowStock flag).
 */
export function serializeInventoryItem(product: Record<string, unknown>): Record<string, unknown> {
  const qty = product.quantity as number;
  const lowStock = product.lowStock as number;
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: Number(product.price),
    quantity: qty,
    lowStock: lowStock,
    isLowStock: qty <= lowStock,
    category: product.category,
    companyId: product.companyId,
    company: product.company,
    image: product.image,
    deletedAt: product.deletedAt,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * Serialize a Prisma Customer row for API responses.
 */
export function serializeCustomer(customer: Record<string, unknown>): Record<string, unknown> {
  return {
    id: customer.id as string,
    name: customer.name as string,
    email: customer.email as string | null,
    phone: customer.phone as string | null,
    address: customer.address as string | null,
    dueAmount: Number(customer.dueAmount ?? 0),
    createdAt: customer.createdAt as Date,
    updatedAt: customer.updatedAt as Date,
  };
}

/**
 * Serialize a Prisma Order row for API responses.
 */
export function serializeOrder(order: Record<string, unknown>): Record<string, unknown> {
  return {
    id: order.id as string,
    customerId: order.customerId as string | null | undefined,
    total: Number(order.total),
    subtotal: Number(order.subtotal ?? 0),
    tax: Number(order.tax ?? 0),
    taxRate: Number(order.taxRate ?? 0),
    paymentMethod: order.paymentMethod as 'cash' | 'card' | null,
    staffId: order.staffId as string | null | undefined,
    status: order.status as 'PENDING' | 'COMPLETED' | 'CANCELLED',
    createdAt: order.createdAt as Date,
    updatedAt: order.updatedAt as Date,
  };
}

/**
 * Serialize a Prisma OrderItem row for API responses.
 */
export function serializeOrderItem(item: Record<string, unknown>): Record<string, unknown> {
  const product = item.product as Record<string, unknown> | null | undefined;
  return {
    id: item.id as string,
    orderId: item.orderId as string,
    productId: item.productId as string,
    quantity: item.quantity as number,
    price: Number(item.price),
    product: product ? serializeProductLite(product) : undefined,
  };
}

/**
 * Serialize just the product fields needed inside order items.
 */
export function serializeProductLite(product: Record<string, unknown>): Record<string, unknown> {
  return {
    id: product.id as string,
    name: product.name as string,
    sku: product.sku as string,
    price: Number(product.price),
    image: product.image as string | null,
  };
}

/**
 * Serialize a Prisma User row for order responses (staff attribution).
 */
export function serializeUser(user: Record<string, unknown>): Record<string, unknown> {
  return {
    id: user.id as string,
    name: user.name as string | null,
    email: user.email as string,
  };
}
