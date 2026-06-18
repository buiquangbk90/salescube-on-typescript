import type { TaxCategory, ProductPriceHistory } from '@salescube/shared';

export class PriceCalculator {
  // Tax rates based on TaxCategory
  private static readonly TAX_RATES = {
    STANDARD: 0.10,  // 10%
    REDUCED: 0.08,    // 8%
    EXEMPT: 0.00     // 0%
  };

  /**
   * Get tax rate for a given tax category
   */
  static getTaxRate(taxCategory: TaxCategory): number {
    return this.TAX_RATES[taxCategory];
  }

  /**
   * Calculate tax amount for a given price
   */
  static calculateTax(amount: number, taxCategory: TaxCategory): number {
    const taxRate = this.getTaxRate(taxCategory);
    return amount * taxRate;
  }

  /**
   * Calculate price including tax
   */
  static calculatePriceIncludingTax(amount: number, taxCategory: TaxCategory): number {
    const tax = this.calculateTax(amount, taxCategory);
    return amount + tax;
  }

  /**
   * Calculate price excluding tax from price including tax
   */
  static calculatePriceExcludingTax(amountIncludingTax: number, taxCategory: TaxCategory): number {
    const taxRate = this.getTaxRate(taxCategory);
    return amountIncludingTax / (1 + taxRate);
  }

  /**
   * Round tax amount (Japanese rounding rules)
   */
  static roundTax(amount: number): number {
    return Math.round(amount);
  }

  /**
   * Round price (Japanese rounding rules)
   */
  static roundPrice(amount: number): number {
    return Math.round(amount);
  }

  /**
   * Calculate tax with proper rounding
   */
  static calculateTaxRounded(amount: number, taxCategory: TaxCategory): number {
    const tax = this.calculateTax(amount, taxCategory);
    return this.roundTax(tax);
  }

  /**
   * Calculate price including tax with proper rounding
   */
  static calculatePriceIncludingTaxRounded(amount: number, taxCategory: TaxCategory): number {
    const priceIncludingTax = this.calculatePriceIncludingTax(amount, taxCategory);
    return this.roundPrice(priceIncludingTax);
  }

  /**
   * Get effective price for a product at a given date
   */
  static getEffectivePrice(
    priceHistory: ProductPriceHistory[],
    priceType: 'RETAIL' | 'WEB' | 'COST',
    date: Date = new Date()
  ): number | null {
    const relevantPrices = priceHistory
      .filter(ph => ph.priceType === priceType)
      .filter(ph => {
        const start = new Date(ph.startDate);
        const end = ph.endDate ? new Date(ph.endDate) : new Date('9999-12-31');
        return date >= start && date <= end;
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return relevantPrices.length > 0 ? relevantPrices[0].price : null;
  }

  /**
   * Calculate price breakdown for display
   */
  static calculatePriceBreakdown(
    basePrice: number,
    taxCategory: TaxCategory
  ): {
    basePrice: number;
    taxAmount: number;
    priceIncludingTax: number;
    taxRate: number;
  } {
    const taxRate = this.getTaxRate(taxCategory);
    const taxAmount = this.calculateTaxRounded(basePrice, taxCategory);
    const priceIncludingTax = this.roundPrice(basePrice + taxAmount);

    return {
      basePrice,
      taxAmount,
      priceIncludingTax,
      taxRate
    };
  }

  /**
   * Validate price history for overlaps
   */
  static validatePriceHistory(
    priceHistory: ProductPriceHistory[],
    newEntry: Omit<ProductPriceHistory, 'id' | 'createdAt'>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const newStart = new Date(newEntry.startDate);
    const newEnd = newEntry.endDate ? new Date(newEntry.endDate) : new Date('9999-12-31');

    // Check for overlaps with existing entries
    const overlappingEntries = priceHistory.filter(ph => {
      if (ph.priceType !== newEntry.priceType) return false;
      
      const existingStart = new Date(ph.startDate);
      const existingEnd = ph.endDate ? new Date(ph.endDate) : new Date('9999-12-31');

      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (overlappingEntries.length > 0) {
      errors.push('Khoảng thời gian giá bị trùng với các mục đã tồn tại');
    }

    // Check date validity
    if (newStart >= newEnd) {
      errors.push('Ngày bắt đầu phải trước ngày kết thúc');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
