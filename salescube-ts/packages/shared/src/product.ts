import { z } from 'zod';

// Enums from Prisma schema
export const ProductSalesTypeSchema = z.enum(['SALES', 'NEWS', 'WEB']);
export const TaxCategorySchema = z.enum(['STANDARD', 'REDUCED', 'EXEMPT']);
export const PriceTypeSchema = z.enum(['RETAIL', 'WEB', 'COST']);

// Types
export type ProductSalesType = z.infer<typeof ProductSalesTypeSchema>;
export type TaxCategory = z.infer<typeof TaxCategorySchema>;
export type PriceType = z.infer<typeof PriceTypeSchema>;

// Base Product type
export const ProductSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  nameKana: z.string().optional(),
  janCode: z.string().optional(),
  salesType: ProductSalesTypeSchema,
  taxCategory: TaxCategorySchema,
  unit: z.string().optional(),
  packQuantity: z.number().int().optional(),
  costPrice: z.number().optional(),
  sellingPrice: z.number().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;

// Product Price History
export const ProductPriceHistorySchema = z.object({
  id: z.string(),
  productId: z.string(),
  priceType: PriceTypeSchema,
  price: z.number(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  remarks: z.string().optional(),
  createdAt: z.string().datetime(),
});

export type ProductPriceHistory = z.infer<typeof ProductPriceHistorySchema>;

// Input schemas
export const CreateProductSchema = z.object({
  code: z.string().min(1, 'Mã sản phẩm không được để trống'),
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  nameKana: z.string().optional(),
  janCode: z.string().optional(),
  salesType: ProductSalesTypeSchema.default('SALES'),
  taxCategory: TaxCategorySchema.default('STANDARD'),
  unit: z.string().optional(),
  packQuantity: z.number().int().positive().optional(),
  costPrice: z.number().nonnegative().optional(),
  sellingPrice: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export const ProductSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  salesType: ProductSalesTypeSchema.optional(),
  taxCategory: TaxCategorySchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export type ProductSearchInput = z.infer<typeof ProductSearchSchema>;

// Product Price History input
export const CreateProductPriceHistorySchema = z.object({
  productId: z.string(),
  priceType: PriceTypeSchema,
  price: z.number().nonnegative(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  remarks: z.string().optional(),
});

export type CreateProductPriceHistoryInput = z.infer<typeof CreateProductPriceHistorySchema>;

// Response types
export const ProductListResponseSchema = z.object({
  rows: z.array(ProductSchema),
  total: z.number(),
});

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
