import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  SalesOrder,
  SalesOrderListResponse,
  SalesOrderSearchInput,
  CreateSalesOrderInput,
  UpdateSalesOrderInput,
  SalesOrderLine,
  CreateSalesOrderLineInput,
  UpdateSalesOrderLineInput,
  UpdateSalesOrderStatusInput,
} from '@salescube/shared';

@Injectable()
export class SalesOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: SalesOrderSearchInput): Promise<SalesOrderListResponse> {
    const {
      page,
      limit,
      search,
      customerId,
      status,
      salesType,
      orderDateFrom,
      orderDateTo,
      deliveryDateFrom,
      deliveryDateTo,
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { orderNo: { contains: search, mode: 'insensitive' } },
        { customerNameSnapshot: { contains: search, mode: 'insensitive' } },
        { customerCodeSnapshot: { contains: search, mode: 'insensitive' } },
        { remarks: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status;
    }

    if (salesType) {
      where.salesType = salesType;
    }

    if (orderDateFrom || orderDateTo) {
      where.orderDate = {};
      if (orderDateFrom) {
        where.orderDate.gte = new Date(orderDateFrom);
      }
      if (orderDateTo) {
        where.orderDate.lte = new Date(orderDateTo);
      }
    }

    if (deliveryDateFrom || deliveryDateTo) {
      where.deliveryDate = {};
      if (deliveryDateFrom) {
        where.deliveryDate.gte = new Date(deliveryDateFrom);
      }
      if (deliveryDateTo) {
        where.deliveryDate.lte = new Date(deliveryDateTo);
      }
    }

    const [rows, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lines: {
            orderBy: { lineNo: 'asc' },
          },
        },
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return {
      rows: rows.map(this.mapToSalesOrder),
      total,
    };
  }

  async findOne(id: string): Promise<SalesOrder | null> {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        lines: {
          orderBy: { lineNo: 'asc' },
        },
      },
    });

    return order ? this.mapToSalesOrder(order) : null;
  }

  async findByOrderNo(orderNo: string): Promise<SalesOrder | null> {
    const order = await this.prisma.salesOrder.findUnique({
      where: { orderNo },
      include: {
        lines: {
          orderBy: { lineNo: 'asc' },
        },
      },
    });

    return order ? this.mapToSalesOrder(order) : null;
  }

  async create(data: CreateSalesOrderInput): Promise<SalesOrder> {
    // First, get customer data for snapshots
    const customer = await this.prisma.customer.findUnique({
      where: { id: data.customerId },
      select: { code: true, name: true },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const order = await this.prisma.salesOrder.create({
      data: {
        orderNo: data.orderNo || this.generateOrderNo(),
        status: 'DRAFT',
        salesType: data.salesType || 'SALES',
        customerId: data.customerId,
        customerNameSnapshot: customer.name,
        customerCodeSnapshot: customer.code,
        inChargeUserId: data.inChargeUserId,
        inChargeName: data.inChargeName,
        orderDate: new Date(data.orderDate),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        cutoffDate: data.cutoffDate ? new Date(data.cutoffDate) : null,
        deliveryName: data.deliveryName,
        deliveryZipCode: data.deliveryZipCode,
        deliveryAddress1: data.deliveryAddress1,
        deliveryAddress2: data.deliveryAddress2,
        deliveryPhone: data.deliveryPhone,
        taxShift: data.taxShift || 'EXCLUDED',
        taxFraction: data.taxFraction || 'FLOOR',
        priceFraction: data.priceFraction || 'FLOOR',
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        remarks: data.remarks,
        lines: {
          create: data.lines.map((line, index) => ({
            lineNo: index + 1,
            productId: line.productId,
            productCode: line.productId ? undefined : line.productName, // Will be updated by service
            productName: line.productName,
            description: line.description,
            quantity: line.quantity,
            unit: line.unit,
            unitPrice: line.unitPrice,
            unitCost: line.unitCost,
            taxCategory: line.taxCategory || 'STANDARD',
            taxRate: this.getTaxRate(line.taxCategory || 'STANDARD'),
            lineSubtotal: line.quantity * line.unitPrice,
            lineTax: 0, // Will be calculated by service
            lineTotal: line.quantity * line.unitPrice, // Will be calculated by service
            remarks: line.remarks,
          })),
        },
      },
      include: {
        lines: {
          orderBy: { lineNo: 'asc' },
        },
      },
    });

    return this.mapToSalesOrder(order);
  }

  async update(id: string, data: UpdateSalesOrderInput): Promise<SalesOrder> {
    const updateData: any = { ...data };

    // Handle date fields
    if (data.orderDate) {
      updateData.orderDate = new Date(data.orderDate);
    }
    if (data.deliveryDate) {
      updateData.deliveryDate = new Date(data.deliveryDate);
    }
    if (data.cutoffDate) {
      updateData.cutoffDate = new Date(data.cutoffDate);
    }

    // Remove lines from main update - they'll be handled separately
    delete updateData.lines;

    const order = await this.prisma.salesOrder.update({
      where: { id },
      data: updateData,
      include: {
        lines: {
          orderBy: { lineNo: 'asc' },
        },
      },
    });

    // Handle lines update if provided
    if (data.lines) {
      // Delete existing lines
      await this.prisma.salesOrderLine.deleteMany({
        where: { salesOrderId: id },
      });

      // Create new lines
      await this.prisma.salesOrderLine.createMany({
        data: data.lines.map((line, index) => ({
          salesOrderId: id,
          lineNo: index + 1,
          productId: line.productId,
          productCode: line.productId ? undefined : line.productName,
          productName: line.productName,
          description: line.description,
          quantity: line.quantity,
          unit: line.unit,
          unitPrice: line.unitPrice,
          unitCost: line.unitCost,
          taxCategory: line.taxCategory || 'STANDARD',
          taxRate: this.getTaxRate(line.taxCategory || 'STANDARD'),
          lineSubtotal: line.quantity * line.unitPrice,
          lineTax: 0,
          lineTotal: line.quantity * line.unitPrice,
          remarks: line.remarks,
        })),
      });
    }

    // Return updated order with lines
    return this.findOne(id) as Promise<SalesOrder>;
  }

  async updateStatus(id: string, data: UpdateSalesOrderStatusInput): Promise<SalesOrder> {
    const order = await this.prisma.salesOrder.update({
      where: { id },
      data: {
        status: data.status as any, // Type assertion to bypass Prisma enum issue
        remarks: data.remarks,
      },
      include: {
        lines: {
          orderBy: { lineNo: 'asc' },
        },
      },
    });

    return this.mapToSalesOrder(order);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.salesOrder.delete({
      where: { id },
    });
  }

  async findLinesByOrderId(orderId: string): Promise<SalesOrderLine[]> {
    const lines = await this.prisma.salesOrderLine.findMany({
      where: { salesOrderId: orderId },
      orderBy: { lineNo: 'asc' },
    });

    return lines.map(this.mapToSalesOrderLine);
  }

  async createLine(data: CreateSalesOrderLineInput): Promise<SalesOrderLine> {
    const line = await this.prisma.salesOrderLine.create({
      data: {
        salesOrderId: data.salesOrderId,
        lineNo: data.lineNo,
        productId: data.productId,
        productCode: data.productId ? undefined : data.productName,
        productName: data.productName,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        unitPrice: data.unitPrice,
        unitCost: data.unitCost,
        taxCategory: data.taxCategory || 'STANDARD',
        taxRate: this.getTaxRate(data.taxCategory || 'STANDARD'),
        lineSubtotal: data.quantity * data.unitPrice,
        lineTax: 0,
        lineTotal: data.quantity * data.unitPrice,
        remarks: data.remarks,
      },
    });

    return this.mapToSalesOrderLine(line);
  }

  async updateLine(id: string, data: UpdateSalesOrderLineInput): Promise<SalesOrderLine> {
    const updateData: any = { ...data };

    const line = await this.prisma.salesOrderLine.update({
      where: { id },
      data: updateData,
    });

    return this.mapToSalesOrderLine(line);
  }

  async removeLine(id: string): Promise<void> {
    await this.prisma.salesOrderLine.delete({
      where: { id },
    });
  }

  private mapToSalesOrder(order: any): SalesOrder {
    return {
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      salesType: order.salesType,
      customerId: order.customerId,
      customerNameSnapshot: order.customerNameSnapshot,
      customerCodeSnapshot: order.customerCodeSnapshot,
      inChargeUserId: order.inChargeUserId,
      inChargeName: order.inChargeName,
      orderDate: order.orderDate.toISOString(),
      deliveryDate: order.deliveryDate?.toISOString(),
      cutoffDate: order.cutoffDate?.toISOString(),
      deliveryName: order.deliveryName,
      deliveryZipCode: order.deliveryZipCode,
      deliveryAddress1: order.deliveryAddress1,
      deliveryAddress2: order.deliveryAddress2,
      deliveryPhone: order.deliveryPhone,
      taxShift: order.taxShift,
      taxFraction: order.taxFraction,
      priceFraction: order.priceFraction,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      grossMargin: order.grossMargin ? Number(order.grossMargin) : undefined,
      remarks: order.remarks,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  private mapToSalesOrderLine(line: any): SalesOrderLine {
    return {
      id: line.id,
      salesOrderId: line.salesOrderId,
      lineNo: line.lineNo,
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      description: line.description,
      quantity: Number(line.quantity),
      unit: line.unit,
      unitPrice: Number(line.unitPrice),
      unitCost: line.unitCost ? Number(line.unitCost) : undefined,
      taxCategory: line.taxCategory,
      taxRate: Number(line.taxRate),
      lineSubtotal: Number(line.lineSubtotal),
      lineTax: Number(line.lineTax),
      lineTotal: Number(line.lineTotal),
      remarks: line.remarks,
      createdAt: line.createdAt.toISOString(),
      updatedAt: line.updatedAt.toISOString(),
    };
  }

  private getTaxRate(taxCategory: string): number {
    switch (taxCategory) {
      case 'STANDARD':
        return 0.10;
      case 'REDUCED':
        return 0.08;
      case 'EXEMPT':
        return 0.00;
      default:
        return 0.10;
    }
  }

  private generateOrderNo(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SO${year}${month}${day}${random}`;
  }
}
