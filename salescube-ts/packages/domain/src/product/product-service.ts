import type { Product, CreateProductInput, UpdateProductInput, ProductPriceHistory, CreateProductPriceHistoryInput, ProductSalesType } from '@salescube/shared';

export class ProductService {
  /**
   * Validate product code uniqueness
   */
  validateProductCode(code: string, existingProducts: Product[]): boolean {
    return !existingProducts.some(p => p.code === code);
  }

  /**
   * Validate JAN code format (13 digits)
   */
  validateJanCode(janCode?: string): boolean {
    if (!janCode) return true; // Optional field
    return /^\d{13}$/.test(janCode);
  }

  /**
   * Calculate effective price for a product at a given date
   */
  calculateEffectivePrice(
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
   * Generate product suggestions based on search query
   */
  generateProductSuggestions(products: Product[], query: string): Product[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return products
      .filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.nameKana && p.nameKana.toLowerCase().includes(lowerQuery)) ||
        p.code.toLowerCase().includes(lowerQuery) ||
        (p.janCode && p.janCode.includes(query))
      )
      .slice(0, 10); // Limit suggestions
  }

  /**
   * Validate product data before creation/update
   */
  validateProductData(data: CreateProductInput | UpdateProductInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.code?.trim()) {
      errors.push('Mã sản phẩm không được để trống');
    }

    if (!data.name?.trim()) {
      errors.push('Tên sản phẩm không được để trống');
    }

    if (data.costPrice !== undefined && data.costPrice < 0) {
      errors.push('Giá vốn không được âm');
    }

    if (data.sellingPrice !== undefined && data.sellingPrice < 0) {
      errors.push('Giá bán không được âm');
    }

    if (data.packQuantity !== undefined && data.packQuantity <= 0) {
      errors.push('Số lượng đóng gói phải lớn hơn 0');
    }

    if (data.janCode && !this.validateJanCode(data.janCode)) {
      errors.push('Mã JAN phải có 13 chữ số');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate profit margin
   */
  calculateProfitMargin(costPrice: number, sellingPrice: number): number {
    if (sellingPrice <= 0) return 0;
    return ((sellingPrice - costPrice) / sellingPrice) * 100;
  }

  /**
   * Check if product price needs update
   */
  needsPriceUpdate(
    currentPrice: number,
    newPrice: number,
    tolerance: number = 0.01
  ): boolean {
    return Math.abs(currentPrice - newPrice) > tolerance;
  }
}
