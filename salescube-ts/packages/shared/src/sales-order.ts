import { z } from 'zod';

// Enums from Prisma schema
export const SlipStatusSchema = z.enum(['DRAFT', 'WAITING', 'APPROVED', 'REJECTED', 'CLOSED']);
export const SalesOrderSalesTypeSchema = z.enum(['SALES', 'NEWS', 'WEB']);
export const SalesOrderTaxShiftSchema = z.enum(['INCLUDED', 'EXCLUDED']);
export const SalesOrderFractionSchema = z.enum(['FLOOR', 'CEIL', 'ROUND']);
export const SalesOrderTaxCategorySchema = z.enum(['STANDARD', 'REDUCED', 'EXEMPT']);

// Types
export type SlipStatus = z.infer<typeof SlipStatusSchema>;
export type SalesOrderSalesType = z.infer<typeof SalesOrderSalesTypeSchema>;
export type SalesOrderTaxShift = z.infer<typeof SalesOrderTaxShiftSchema>;
export type SalesOrderFraction = z.infer<typeof SalesOrderFractionSchema>;
export type SalesOrderTaxCategory = z.infer<typeof SalesOrderTaxCategorySchema>;

// Base SalesOrder type
export const SalesOrderSchema = z.object({
  id: z.string(),
  orderNo: z.string(),
  status: SlipStatusSchema,
  salesType: SalesOrderSalesTypeSchema,
  customerId: z.string(),
  customerNameSnapshot: z.string(),
  customerCodeSnapshot: z.string(),
  inChargeUserId: z.string().optional(),
  inChargeName: z.string().optional(),
  orderDate: z.string().datetime(),
  deliveryDate: z.string().datetime().optional(),
  cutoffDate: z.string().datetime().optional(),
  deliveryName: z.string().optional(),
  deliveryZipCode: z.string().optional(),
  deliveryAddress1: z.string().optional(),
  deliveryAddress2: z.string().optional(),
  deliveryPhone: z.string().optional(),
  taxShift: SalesOrderTaxShiftSchema.default('EXCLUDED'),
  taxFraction: SalesOrderFractionSchema.default('FLOOR'),
  priceFraction: SalesOrderFractionSchema.default('FLOOR'),
  subtotal: z.number(),
  taxAmount: z.number(),
  totalAmount: z.number(),
  grossMargin: z.number().optional(),
  remarks: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SalesOrder = z.infer<typeof SalesOrderSchema>;

// SalesOrderLine type
export const SalesOrderLineSchema = z.object({
  id: z.string(),
  salesOrderId: z.string(),
  lineNo: z.number().int(),
  productId: z.string().optional(),
  productCode: z.string().optional(),
  productName: z.string(),
  description: z.string().optional(),
  quantity: z.number(),
  unit: z.string().optional(),
  unitPrice: z.number(),
  unitCost: z.number().optional(),
  taxCategory: SalesOrderTaxCategorySchema.default('STANDARD'),
  taxRate: z.number(),
  lineSubtotal: z.number(),
  lineTax: z.number(),
  lineTotal: z.number(),
  remarks: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SalesOrderLine = z.infer<typeof SalesOrderLineSchema>;

// SalesOrder with lines
export const SalesOrderWithLinesSchema = SalesOrderSchema.extend({
  lines: z.array(SalesOrderLineSchema),
});

export type SalesOrderWithLines = z.infer<typeof SalesOrderWithLinesSchema>;

// Input schemas
export const CreateSalesOrderSchema = z.object({
  orderNo: z.string().optional(),
  customerId: z.string().min(1, 'Khách hàng không được để trống'),
  salesType: SalesOrderSalesTypeSchema.default('SALES'),
  orderDate: z.string().datetime(),
  deliveryDate: z.string().datetime().optional(),
  cutoffDate: z.string().datetime().optional(),
  deliveryName: z.string().optional(),
  deliveryZipCode: z.string().optional(),
  deliveryAddress1: z.string().optional(),
  deliveryAddress2: z.string().optional(),
  deliveryPhone: z.string().optional(),
  taxShift: SalesOrderTaxShiftSchema.default('EXCLUDED'),
  taxFraction: SalesOrderFractionSchema.default('FLOOR'),
  priceFraction: SalesOrderFractionSchema.default('FLOOR'),
  inChargeUserId: z.string().optional(),
  inChargeName: z.string().optional(),
  remarks: z.string().optional(),
  lines: z.array(z.object({
    productId: z.string().optional(),
    productName: z.string().min(1, 'Tên sản phẩm không được để trống'),
    description: z.string().optional(),
    quantity: z.number().positive('Số lượng phải lớn hơn 0'),
    unit: z.string().optional(),
    unitPrice: z.number().nonnegative('Đơn giá phải lớn hơn hoặc bằng 0'),
    unitCost: z.number().nonnegative().optional(),
    taxCategory: SalesOrderTaxCategorySchema.default('STANDARD'),
    remarks: z.string().optional(),
  })).min(1, 'Phải có ít nhất một dòng sản phẩm'),
});

export type CreateSalesOrderInput = z.infer<typeof CreateSalesOrderSchema>;

export const UpdateSalesOrderSchema = CreateSalesOrderSchema.partial().extend({
  id: z.string(),
  orderNo: z.string().optional(),
});

export type UpdateSalesOrderInput = z.infer<typeof UpdateSalesOrderSchema>;

// SalesOrderLine input schemas
export const CreateSalesOrderLineSchema = z.object({
  salesOrderId: z.string(),
  lineNo: z.number().int().positive(),
  productId: z.string().optional(),
  productName: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().optional(),
  quantity: z.number().positive('Số lượng phải lớn hơn 0'),
  unit: z.string().optional(),
  unitPrice: z.number().nonnegative('Đơn giá phải lớn hơn hoặc bằng 0'),
  unitCost: z.number().nonnegative().optional(),
  taxCategory: SalesOrderTaxCategorySchema.default('STANDARD'),
  remarks: z.string().optional(),
});

export type CreateSalesOrderLineInput = z.infer<typeof CreateSalesOrderLineSchema>;

export const UpdateSalesOrderLineSchema = CreateSalesOrderLineSchema.partial();

export type UpdateSalesOrderLineInput = z.infer<typeof UpdateSalesOrderLineSchema>;

// Search/Filter schemas
export const SalesOrderSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  customerId: z.string().optional(),
  status: SlipStatusSchema.optional(),
  salesType: SalesOrderSalesTypeSchema.optional(),
  orderDateFrom: z.string().datetime().optional(),
  orderDateTo: z.string().datetime().optional(),
  deliveryDateFrom: z.string().datetime().optional(),
  deliveryDateTo: z.string().datetime().optional(),
});

export type SalesOrderSearchInput = z.infer<typeof SalesOrderSearchSchema>;

// List response
export const SalesOrderListResponseSchema = z.object({
  rows: z.array(SalesOrderSchema),
  total: z.number(),
});

export type SalesOrderListResponse = z.infer<typeof SalesOrderListResponseSchema>;

// Status update schema
export const UpdateSalesOrderStatusSchema = z.object({
  status: SlipStatusSchema,
  remarks: z.string().optional(),
});

export type UpdateSalesOrderStatusInput = z.infer<typeof UpdateSalesOrderStatusSchema>;

// Order calculation result
export const OrderCalculationSchema = z.object({
  subtotal: z.number(),
  taxAmount: z.number(),
  totalAmount: z.number(),
  grossMargin: z.number().optional(),
  lineCalculations: z.array(z.object({
    lineNo: z.number().int(),
    lineSubtotal: z.number(),
    lineTax: z.number(),
    lineTotal: z.number(),
  })),
});

export type OrderCalculation = z.infer<typeof OrderCalculationSchema>;
