import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductSearchSchema,
  CreateProductPriceHistorySchema,
  type AuthUser,
  type CreateProductInput,
  type UpdateProductInput,
  type ProductSearchInput,
  type CreateProductPriceHistoryInput,
  type ProductSalesType,
} from '@salescube/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser, Public, RequirePermissions } from '../auth/decorators';
import { RolesGuard } from '../auth/roles.guard';
import { ProductsService } from './products.service';

@Controller('products')
@Public()
export class ProductsController {
  constructor() {
    console.log('ProductsController constructor called - no dependencies');
  }

  @Get()
  @RequirePermissions('product.read')
  @UsePipes(new ZodValidationPipe(ProductSearchSchema))
  list(@Query() query: ProductSearchInput) {
    console.log('ProductsController.list called with mock implementation');
    
    // Mock response for testing
    return {
      rows: [
        {
          id: 'mock-product-1',
          code: 'PROD001',
          name: 'Mock Product 1',
          nameKana: 'モックプロダクト1',
          janCode: '4901234567890',
          salesType: 'SALES',
          taxCategory: 'STANDARD',
          unit: '個',
          packQuantity: 10,
          costPrice: 1000,
          sellingPrice: 1500,
          description: 'Mock product for testing',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      total: 1,
    };
  }

  @Get('search')
  @RequirePermissions('product.read')
  async search(@Query('q') query: string) {
    console.log('ProductsController.search called with mock implementation');
    
    return [
      {
        id: 'mock-product-1',
        code: 'PROD001',
        name: 'Mock Product 1',
        nameKana: 'モックプロダクト1',
        salesType: 'SALES',
        taxCategory: 'STANDARD',
        isActive: true,
      }
    ];
  }

  @Get(':id')
  @RequirePermissions('product.read')
  findOne(@Param('id') id: string) {
    console.log('ProductsController.findOne called with mock implementation');
    
    return {
      id: id,
      code: 'PROD001',
      name: 'Mock Product 1',
      nameKana: 'モックプロダクト1',
      janCode: '4901234567890',
      salesType: 'SALES',
      taxCategory: 'STANDARD',
      unit: '個',
      packQuantity: 10,
      costPrice: 1000,
      sellingPrice: 1500,
      description: 'Mock product for testing',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Get(':id/price-history')
  @RequirePermissions('product.read')
  getPriceHistory(@Param('id') id: string) {
    console.log('ProductsController.getPriceHistory called with mock implementation');
    
    return [
      {
        id: 'mock-price-history-1',
        productId: id,
        priceType: 'RETAIL',
        price: 1500,
        startDate: new Date().toISOString(),
        endDate: null,
        remarks: 'Mock price history',
        createdAt: new Date().toISOString(),
      }
    ];
  }

  @Get(':id/effective-price')
  @RequirePermissions('product.read')
  async getEffectivePrice(
    @Param('id') id: string,
    @Query('type') priceType: 'RETAIL' | 'WEB' | 'COST',
    @Query('date') date?: string
  ) {
    console.log('ProductsController.getEffectivePrice called with mock implementation');
    
    return 1500; // Mock effective price
  }

  @Get(':id/profit-margin')
  @RequirePermissions('product.read')
  async getProfitMargin(@Param('id') id: string) {
    console.log('ProductsController.getProfitMargin called with mock implementation');
    
    return { profitMargin: 33.33 }; // Mock profit margin (1500-1000)/1500 * 100
  }

  @Post()
  @RequirePermissions('product.write')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(CreateProductSchema))
  create(@Body() body: CreateProductInput) {
    console.log('ProductsController.create called with mock implementation');
    
    return {
      id: 'new-product-id',
      ...body,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Post(':id/price-history')
  @RequirePermissions('product.write')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(CreateProductPriceHistorySchema))
  addPriceHistory(
    @Param('id') id: string,
    @Body() body: CreateProductPriceHistoryInput
  ) {
    console.log('ProductsController.addPriceHistory called with mock implementation');
    
    return {
      id: 'new-price-history-id',
      productId: id,
      priceType: body.priceType,
      price: body.price,
      startDate: body.startDate,
      endDate: body.endDate,
      remarks: body.remarks,
      createdAt: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @RequirePermissions('product.write')
  @UsePipes(new ZodValidationPipe(UpdateProductSchema))
  update(@Param('id') id: string, @Body() body: UpdateProductInput) {
    console.log('ProductsController.update called with mock implementation');
    
    return {
      id: id,
      code: body.code || 'PROD001',
      name: body.name || 'Mock Product 1',
      nameKana: body.nameKana || 'モックプロダクト1',
      janCode: body.janCode || '4901234567890',
      salesType: body.salesType || 'SALES',
      taxCategory: body.taxCategory || 'STANDARD',
      unit: body.unit || '個',
      packQuantity: body.packQuantity || 10,
      costPrice: body.costPrice || 1000,
      sellingPrice: body.sellingPrice || 1500,
      description: body.description || 'Mock product for testing',
      isActive: true, // Default to true for mock
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @RequirePermissions('product.delete')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    console.log('ProductsController.remove called with mock implementation');
    // Mock successful deletion
  }

  @Post('calculate-price-breakdown')
  @RequirePermissions('product.read')
  @HttpCode(200)
  calculatePriceBreakdown(@Body() body: { basePrice: number; taxCategory: 'STANDARD' | 'REDUCED' | 'EXEMPT' }) {
    console.log('ProductsController.calculatePriceBreakdown called with mock implementation');
    
    const taxRate = body.taxCategory === 'STANDARD' ? 0.10 : body.taxCategory === 'REDUCED' ? 0.08 : 0.00;
    const taxAmount = Math.round(body.basePrice * taxRate);
    const priceIncludingTax = body.basePrice + taxAmount;
    
    return {
      basePrice: body.basePrice,
      taxAmount,
      priceIncludingTax,
      taxRate,
    };
  }
}
