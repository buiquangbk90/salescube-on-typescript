import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import type {
  Product,
  ProductListResponse,
  ProductSearchInput,
  CreateProductInput,
  UpdateProductInput,
  ProductPriceHistory,
  CreateProductPriceHistoryInput,
  AuthUser,
  ProductSalesType,
} from '@salescube/shared';
import { ProductService, PriceCalculator } from '@salescube/domain';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  private readonly productService = new ProductService();

  constructor(private readonly repository: ProductsRepository) {}

  async findAll(query: ProductSearchInput): Promise<ProductListResponse> {
    return this.repository.findAll(query);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repository.findOne(id);
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }
    return product;
  }

  async findByCode(code: string): Promise<Product | null> {
    return this.repository.findByCode(code);
  }

  async create(data: CreateProductInput, user: AuthUser): Promise<Product> {
    // Validate product data
    const validation = this.productService.validateProductData(data);
    if (!validation.isValid) {
      throw new ConflictException(validation.errors.join(', '));
    }

    // Check for duplicate code
    const existingProducts = await this.repository.findAll({ page: 1, limit: 1 });
    if (!this.productService.validateProductCode(data.code, existingProducts.rows)) {
      throw new ConflictException('Mã sản phẩm đã tồn tại');
    }

    // Create product
    const product = await this.repository.create(data);

    return product;
  }

  async update(id: string, data: UpdateProductInput, user: AuthUser): Promise<Product> {
    // Check if product exists
    const existingProduct = await this.repository.findOne(id);
    if (!existingProduct) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Validate product data
    const validation = this.productService.validateProductData(data);
    if (!validation.isValid) {
      throw new ConflictException(validation.errors.join(', '));
    }

    // Check for duplicate code (if code is being updated)
    if (data.code && data.code !== existingProduct.code) {
      const existingProducts = await this.repository.findAll({ page: 1, limit: 100 });
      const otherProducts = existingProducts.rows.filter(p => p.id !== id);
      if (!this.productService.validateProductCode(data.code, otherProducts)) {
        throw new ConflictException('Mã sản phẩm đã tồn tại');
      }
    }

    // Update product
    const product = await this.repository.update(id, data);

    return product;
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    // Check if product exists
    const product = await this.repository.findOne(id);
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Soft delete
    await this.repository.remove(id);
  }

  async getPriceHistory(productId: string): Promise<ProductPriceHistory[]> {
    // Check if product exists
    const product = await this.repository.findOne(productId);
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    return this.repository.findPriceHistory(productId);
  }

  async addPriceHistory(data: CreateProductPriceHistoryInput, user: AuthUser): Promise<ProductPriceHistory> {
    // Check if product exists
    const product = await this.repository.findOne(data.productId);
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Get existing price history
    const existingHistory = await this.repository.findPriceHistory(data.productId);

    // Validate price history
    const validation = PriceCalculator.validatePriceHistory(existingHistory, data);

    if (!validation.isValid) {
      throw new ConflictException(validation.errors.join(', '));
    }

    // Add price history
    return this.repository.addPriceHistory(data);
  }

  async getEffectivePrice(productId: string, priceType: 'RETAIL' | 'WEB' | 'COST', date?: Date): Promise<number | null> {
    const product = await this.repository.findOne(productId);
    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const priceHistory = await this.repository.findPriceHistory(productId);
    return this.productService.calculateEffectivePrice(priceHistory, priceType, date);
  }

  async searchSuggestions(query: string): Promise<Product[]> {
    const products = await this.repository.findAll({ page: 1, limit: 50 });
    return this.productService.generateProductSuggestions(products.rows, query);
  }

  calculateProfitMargin(costPrice: number, sellingPrice: number): number {
    return this.productService.calculateProfitMargin(costPrice, sellingPrice);
  }

  calculatePriceBreakdown(basePrice: number, taxCategory: 'STANDARD' | 'REDUCED' | 'EXEMPT') {
    return PriceCalculator.calculatePriceBreakdown(basePrice, taxCategory);
  }
}
