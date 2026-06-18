/**
 * Pure business logic for SalesCube.
 *
 * This package MUST NOT depend on NestJS, Next.js, Prisma, or any I/O.
 * Only deterministic functions and value objects belong here.
 *
 * Modules will be added during migration:
 * - sales/calculate-tax.ts
 * - sales/calculate-order-total.ts
 * - invoices/generate-invoice.ts
 * - invoices/closing-period-policy.ts
 * - deposits/payment-allocation-policy.ts
 */

export const DOMAIN_VERSION = '0.0.1';

export * from './customer';
export * from './product';
export * from './sales-order';
