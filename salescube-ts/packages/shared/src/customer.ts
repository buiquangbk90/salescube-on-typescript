import { z } from 'zod';

/**
 * Customer (得意先) - shared Zod schemas.
 * Used by both API (validation) and Web (forms).
 */

export const taxShiftSchema = z.enum(['INCLUDED', 'EXCLUDED']);
export const fractionSchema = z.enum(['FLOOR', 'CEIL', 'ROUND']);
export const paybackCycleSchema = z.enum([
  'CURRENT_MONTH',
  'NEXT_MONTH',
  'AFTER_NEXT_MONTH',
  'MONTHS_3',
]);

const optionalString = z
  .string()
  .trim()
  .max(255)
  .optional()
  .or(z.literal('').transform(() => undefined));

export const createCustomerSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Mã khách hàng là bắt buộc')
    .max(20, 'Tối đa 20 ký tự')
    .regex(/^[A-Za-z0-9_-]+$/, 'Chỉ chấp nhận chữ, số, gạch ngang, gạch dưới'),
  name: z.string().trim().min(1, 'Tên là bắt buộc').max(255),
  nameKana: optionalString,
  abbr: optionalString,
  officeName: optionalString,
  officeNameKana: optionalString,
  departmentName: optionalString,

  zipCode: optionalString,
  address1: optionalString,
  address2: optionalString,

  contactName: optionalString,
  contactNameKana: optionalString,
  contactSalutation: optionalString,
  contactTitle: optionalString,

  phone: optionalString,
  fax: optionalString,
  email: z
    .string()
    .trim()
    .email('Email không hợp lệ')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  url: optionalString,

  businessCategory: optionalString,
  rankCategory: optionalString,

  taxShift: taxShiftSchema.default('EXCLUDED'),
  taxFraction: fractionSchema.default('FLOOR'),
  priceFraction: fractionSchema.default('FLOOR'),

  cutoffGroup: optionalString,
  cutoffDay: z
    .number()
    .int()
    .min(1)
    .max(31)
    .optional()
    .or(z.null().transform(() => undefined)),
  paybackCycle: paybackCycleSchema.default('NEXT_MONTH'),

  discountRate: z.number().min(0).max(1).optional(),
  creditLimit: z.number().nonnegative().optional(),

  bankCode: optionalString,
  bankName: optionalString,
  bankBranchName: optionalString,
  bankAccountType: optionalString,
  bankAccountNo: optionalString,
  bankAccountHolder: optionalString,

  inChargeUserId: optionalString,

  remarks: z.string().max(2000).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .omit({ code: true });

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const customerSearchSchema = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CustomerSearchInput = z.infer<typeof customerSearchSchema>;

export interface CustomerDto {
  id: string;
  code: string;
  name: string;
  nameKana: string | null;
  abbr: string | null;
  officeName: string | null;
  zipCode: string | null;
  address1: string | null;
  address2: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  taxShift: 'INCLUDED' | 'EXCLUDED';
  taxFraction: 'FLOOR' | 'CEIL' | 'ROUND';
  priceFraction: 'FLOOR' | 'CEIL' | 'ROUND';
  cutoffGroup: string | null;
  cutoffDay: number | null;
  paybackCycle: 'CURRENT_MONTH' | 'NEXT_MONTH' | 'AFTER_NEXT_MONTH' | 'MONTHS_3';
  discountRate: string | null;
  creditLimit: string | null;
  inChargeUserId: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
