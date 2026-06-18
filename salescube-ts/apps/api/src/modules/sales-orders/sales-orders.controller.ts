import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  CreateSalesOrderSchema,
  UpdateSalesOrderSchema,
  SalesOrderSearchSchema,
  UpdateSalesOrderStatusSchema,
  CreateSalesOrderLineSchema,
  UpdateSalesOrderLineSchema,
  type AuthUser,
  type CreateSalesOrderInput,
  type UpdateSalesOrderInput,
  type SalesOrderSearchInput,
  type UpdateSalesOrderStatusInput,
  type CreateSalesOrderLineInput,
  type UpdateSalesOrderLineInput,
} from '@salescube/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser, Public, RequirePermissions } from '../auth/decorators';
import { SalesOrdersService } from './sales-orders.service';

@Controller('sales-orders')
@Public()
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Get()
  @RequirePermissions('sales-order.read')
  @UsePipes(new ZodValidationPipe(SalesOrderSearchSchema))
  list(@Query() query: SalesOrderSearchInput) {
    console.log('SalesOrdersController.list called with mock implementation');
    
    // Mock response for testing
    return {
      rows: [
        {
          id: 'mock-sales-order-1',
          orderNo: 'SO240618001',
          status: 'DRAFT',
          salesType: 'SALES',
          customerId: 'mock-customer-1',
          customerNameSnapshot: 'Mock Customer 1',
          customerCodeSnapshot: 'CUST001',
          inChargeUserId: 'user-1',
          inChargeName: 'Mock User',
          orderDate: new Date().toISOString(),
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          cutoffDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryName: 'Mock Delivery Name',
          deliveryZipCode: '123-4567',
          deliveryAddress1: 'Mock Address 1',
          deliveryAddress2: 'Mock Address 2',
          deliveryPhone: '090-1234-5678',
          taxShift: 'EXCLUDED',
          taxFraction: 'FLOOR',
          priceFraction: 'FLOOR',
          subtotal: 10000,
          taxAmount: 1000,
          totalAmount: 11000,
          grossMargin: 2000,
          remarks: 'Mock sales order remarks',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      total: 1,
    };
  }

  @Get('search')
  @RequirePermissions('sales-order.read')
  async search(@Query('q') query: string) {
    console.log('SalesOrdersController.search called with mock implementation');
    
    return [
      {
        id: 'mock-sales-order-1',
        orderNo: 'SO240618001',
        status: 'DRAFT',
        customerNameSnapshot: 'Mock Customer 1',
        customerCodeSnapshot: 'CUST001',
        totalAmount: 11000,
        createdAt: new Date().toISOString(),
      }
    ];
  }

  @Get('statuses')
  @RequirePermissions('sales-order.read')
  async getStatuses() {
    console.log('SalesOrdersController.getStatuses called with mock implementation');
    
    return [
      { status: 'DRAFT', label: 'Nháp' },
      { status: 'WAITING', label: 'Chờ duyệt' },
      { status: 'APPROVED', label: 'Đã duyệt' },
      { status: 'REJECTED', label: 'Từ chối' },
      { status: 'CLOSED', label: 'Đã đóng' },
    ];
  }

  @Get('sales-types')
  @RequirePermissions('sales-order.read')
  async getSalesTypes() {
    console.log('SalesOrdersController.getSalesTypes called with mock implementation');
    
    return [
      { type: 'SALES', label: 'Hàng hóa' },
      { type: 'NEWS', label: 'Báo chí' },
      { type: 'WEB', label: 'Quảng cáo Web' },
    ];
  }

  @Get('tax-categories')
  @RequirePermissions('sales-order.read')
  async getTaxCategories() {
    console.log('SalesOrdersController.getTaxCategories called with mock implementation');
    
    return [
      { category: 'STANDARD', label: '10% (Tiêu chuẩn)', rate: 0.10 },
      { category: 'REDUCED', label: '8% (Giảm)', rate: 0.08 },
      { category: 'EXEMPT', label: '0% (Miễn thuế)', rate: 0.00 },
    ];
  }

  @Get(':id')
  @RequirePermissions('sales-order.read')
  findOne(@Param('id') id: string) {
    console.log('SalesOrdersController.findOne called with mock implementation');
    
    return {
      id: id,
      orderNo: 'SO240618001',
      status: 'DRAFT',
      salesType: 'SALES',
      customerId: 'mock-customer-1',
      customerNameSnapshot: 'Mock Customer 1',
      customerCodeSnapshot: 'CUST001',
      inChargeUserId: 'user-1',
      inChargeName: 'Mock User',
      orderDate: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      cutoffDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      deliveryName: 'Mock Delivery Name',
      deliveryZipCode: '123-4567',
      deliveryAddress1: 'Mock Address 1',
      deliveryAddress2: 'Mock Address 2',
      deliveryPhone: '090-1234-5678',
      taxShift: 'EXCLUDED',
      taxFraction: 'FLOOR',
      priceFraction: 'FLOOR',
      subtotal: 10000,
      taxAmount: 1000,
      totalAmount: 11000,
      grossMargin: 2000,
      remarks: 'Mock sales order remarks',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lines: [
        {
          id: 'mock-line-1',
          salesOrderId: id,
          lineNo: 1,
          productId: 'mock-product-1',
          productCode: 'PROD001',
          productName: 'Mock Product 1',
          description: 'Mock product description',
          quantity: 2,
          unit: 'cái',
          unitPrice: 5000,
          unitCost: 3000,
          taxCategory: 'STANDARD',
          taxRate: 0.10,
          lineSubtotal: 10000,
          lineTax: 1000,
          lineTotal: 11000,
          remarks: 'Mock line remarks',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
    };
  }

  @Get(':id/lines')
  @RequirePermissions('sales-order.read')
  getLines(@Param('id') id: string) {
    console.log('SalesOrdersController.getLines called with mock implementation');
    
    return [
      {
        id: 'mock-line-1',
        salesOrderId: id,
        lineNo: 1,
        productId: 'mock-product-1',
        productCode: 'PROD001',
        productName: 'Mock Product 1',
        description: 'Mock product description',
        quantity: 2,
        unit: 'cái',
        unitPrice: 5000,
        unitCost: 3000,
        taxCategory: 'STANDARD',
        taxRate: 0.10,
        lineSubtotal: 10000,
        lineTax: 1000,
        lineTotal: 11000,
        remarks: 'Mock line remarks',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
  }

  @Post()
  @RequirePermissions('sales-order.write')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(CreateSalesOrderSchema))
  create(@Body() body: CreateSalesOrderInput) {
    console.log('SalesOrdersController.create called with mock implementation');
    
    return {
      id: 'new-sales-order-id',
      orderNo: body.orderNo || 'SO240618002',
      status: 'DRAFT',
      salesType: body.salesType || 'SALES',
      customerId: body.customerId,
      customerNameSnapshot: 'Mock Customer Name',
      customerCodeSnapshot: 'CUST001',
      orderDate: body.orderDate,
      deliveryDate: body.deliveryDate,
      subtotal: 10000,
      taxAmount: 1000,
      totalAmount: 11000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      inChargeUserId: body.inChargeUserId,
      inChargeName: body.inChargeName,
      cutoffDate: body.cutoffDate,
      deliveryName: body.deliveryName,
      deliveryZipCode: body.deliveryZipCode,
      deliveryAddress1: body.deliveryAddress1,
      deliveryAddress2: body.deliveryAddress2,
      deliveryPhone: body.deliveryPhone,
      taxShift: body.taxShift,
      taxFraction: body.taxFraction,
      priceFraction: body.priceFraction,
      remarks: body.remarks,
      lines: body.lines,
    };
  }

  @Post('calculate-totals')
  @RequirePermissions('sales-order.read')
  @HttpCode(200)
  calculateTotals(@Body() body: CreateSalesOrderInput) {
    console.log('SalesOrdersController.calculateTotals called with mock implementation');
    
    const subtotal = body.lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
    const taxAmount = Math.round(subtotal * 0.10); // 10% tax
    const totalAmount = subtotal + taxAmount;
    
    return {
      subtotal,
      taxAmount,
      totalAmount,
      grossMargin: 2000,
      lineCalculations: body.lines.map((line, index) => ({
        lineNo: index + 1,
        lineSubtotal: line.quantity * line.unitPrice,
        lineTax: Math.round(line.quantity * line.unitPrice * 0.10),
        lineTotal: line.quantity * line.unitPrice + Math.round(line.quantity * line.unitPrice * 0.10),
      })),
    };
  }

  @Post(':id/lines')
  @RequirePermissions('sales-order.write')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(CreateSalesOrderLineSchema))
  addLine(
    @Param('id') id: string,
    @Body() body: CreateSalesOrderLineInput
  ) {
    console.log('SalesOrdersController.addLine called with mock implementation');
    
    return {
      id: 'new-line-id',
      salesOrderId: id,
      lineNo: body.lineNo,
      productId: body.productId,
      productCode: '', // Will be populated by service
      productName: body.productName,
      description: body.description,
      quantity: body.quantity,
      unit: body.unit,
      unitPrice: body.unitPrice,
      unitCost: body.unitCost,
      taxCategory: body.taxCategory,
      taxRate: 0.10,
      lineSubtotal: body.quantity * body.unitPrice,
      lineTax: Math.round(body.quantity * body.unitPrice * 0.10),
      lineTotal: body.quantity * body.unitPrice + Math.round(body.quantity * body.unitPrice * 0.10),
      remarks: body.remarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @RequirePermissions('sales-order.write')
  @UsePipes(new ZodValidationPipe(UpdateSalesOrderSchema))
  update(@Param('id') id: string, @Body() body: UpdateSalesOrderInput) {
    console.log('SalesOrdersController.update called with mock implementation');
    
    return {
      id: id,
      orderNo: body.orderNo || 'SO240618001',
      status: 'DRAFT',
      salesType: body.salesType || 'SALES',
      customerId: body.customerId || 'mock-customer-1',
      customerNameSnapshot: 'Mock Customer 1',
      customerCodeSnapshot: 'CUST001',
      inChargeUserId: body.inChargeUserId,
      inChargeName: body.inChargeName,
      orderDate: body.orderDate || new Date().toISOString(),
      deliveryDate: body.deliveryDate,
      cutoffDate: body.cutoffDate,
      deliveryName: body.deliveryName,
      deliveryZipCode: body.deliveryZipCode,
      deliveryAddress1: body.deliveryAddress1,
      deliveryAddress2: body.deliveryAddress2,
      deliveryPhone: body.deliveryPhone,
      taxShift: body.taxShift,
      taxFraction: body.taxFraction,
      priceFraction: body.priceFraction,
      subtotal: 10000,
      taxAmount: 1000,
      totalAmount: 11000,
      remarks: body.remarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lines: body.lines,
    };
  }

  @Patch(':id/status')
  @RequirePermissions('sales-order.write')
  @UsePipes(new ZodValidationPipe(UpdateSalesOrderStatusSchema))
  updateStatus(@Param('id') id: string, @Body() body: UpdateSalesOrderStatusInput) {
    console.log('SalesOrdersController.updateStatus called with mock implementation');
    
    return {
      id: id,
      orderNo: 'SO240618001',
      status: body.status,
      remarks: body.remarks,
      updatedAt: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @RequirePermissions('sales-order.delete')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    console.log('SalesOrdersController.remove called with mock implementation');
    // Mock successful deletion
  }

  @Delete('lines/:lineId')
  @RequirePermissions('sales-order.write')
  @HttpCode(204)
  async removeLine(@Param('lineId') lineId: string) {
    console.log('SalesOrdersController.removeLine called with mock implementation');
    // Mock successful line deletion
  }
}
