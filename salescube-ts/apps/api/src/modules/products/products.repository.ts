import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  Product,
  ProductListResponse,
  ProductSearchInput,
  CreateProductInput,
  UpdateProductInput,
  ProductPriceHistory,
  CreateProductPriceHistoryInput,
  ProductSalesType,
} from '@salescube/shared';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductSearchInput): Promise<ProductListResponse> {
    const { page, limit, search, salesType, taxCategory, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameKana: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { janCode: { contains: search } },
      ];
    }

    if (salesType) {
      where.salesType = salesType;
    }

    if (taxCategory) {
      where.taxCategory = taxCategory;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          prices: {
            orderBy: { startDate: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      rows: rows.map(this.mapToProduct),
      total,
    };
  }

  async findOne(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        prices: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    return product ? this.mapToProduct(product) : null;
  }

  async findByCode(code: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { code },
      include: {
        prices: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    return product ? this.mapToProduct(product) : null;
  }

  async create(data: CreateProductInput): Promise<Product> {
    const product = await this.prisma.product.create({
      data: {
        ...data,
        costPrice: data.costPrice ? data.costPrice.toString() : undefined,
        retailPrice: data.sellingPrice ? data.sellingPrice.toString() : undefined,
      },
      include: {
        prices: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    return this.mapToProduct(product);
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const updateData: any = { ...data };

    if (data.costPrice !== undefined) {
      updateData.costPrice = data.costPrice?.toString();
    }

    if (data.sellingPrice !== undefined) {
      updateData.retailPrice = data.sellingPrice?.toString();
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        prices: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    return this.mapToProduct(product);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }

  async findPriceHistory(productId: string): Promise<ProductPriceHistory[]> {
    const history = await this.prisma.productPriceHistory.findMany({
      where: { productId },
      orderBy: { startDate: 'desc' },
    });

    return history.map(this.mapToPriceHistory);
  }

  async addPriceHistory(data: CreateProductPriceHistoryInput): Promise<ProductPriceHistory> {
    const history = await this.prisma.productPriceHistory.create({
      data: {
        ...data,
        price: data.price.toString(),
      },
    });

    return this.mapToPriceHistory(history);
  }

  private mapToProduct(product: any): Product {
    return {
      id: product.id,
      code: product.code,
      name: product.name,
      nameKana: product.nameKana,
      janCode: product.janCode,
      salesType: product.salesType,
      taxCategory: product.taxCategory,
      unit: product.unit,
      packQuantity: product.packQuantity,
      costPrice: product.costPrice ? parseFloat(product.costPrice) : undefined,
      sellingPrice: product.retailPrice ? parseFloat(product.retailPrice) : undefined,
      description: product.description,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  private mapToPriceHistory(history: any): ProductPriceHistory {
    return {
      id: history.id,
      productId: history.productId,
      priceType: history.priceType,
      price: parseFloat(history.price),
      startDate: history.startDate.toISOString(),
      endDate: history.endDate?.toISOString(),
      remarks: history.remarks,
      createdAt: history.createdAt.toISOString(),
    };
  }
}
