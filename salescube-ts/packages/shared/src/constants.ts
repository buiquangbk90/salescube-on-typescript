/**
 * Shared constants across SalesCube apps.
 */

export const APP_NAME = 'SalesCube';

/**
 * Sales slip types (mirroring legacy SalesSlipTrn.TYPE_*).
 * @see workspace/SalesCube/src/main/java/jp/co/arkinfosys/entity/SalesSlipTrn.java
 */
export const SALES_TYPE = {
  SALES: '0',
  NEWS: '1',
  WEB: '2',
} as const;

export type SalesType = (typeof SALES_TYPE)[keyof typeof SALES_TYPE];

/**
 * Slip status (mirroring legacy STATUS_INIT / STATUS_FINISH / STATUS_CLOSE).
 */
export const SLIP_STATUS = {
  INIT: '0',
  FINISH: '9',
  CLOSE: '9',
} as const;

/**
 * Tax shift category (内税 / 外税).
 */
export const TAX_SHIFT = {
  INCLUDED: 'INCLUDED', // 内税
  EXCLUDED: 'EXCLUDED', // 外税
} as const;

export type TaxShift = (typeof TAX_SHIFT)[keyof typeof TAX_SHIFT];

/**
 * Tax fraction (rounding) policy.
 */
export const FRACTION = {
  FLOOR: 'FLOOR', // 切り捨て
  CEIL: 'CEIL', // 切り上げ
  ROUND: 'ROUND', // 四捨五入
} as const;

export type Fraction = (typeof FRACTION)[keyof typeof FRACTION];
