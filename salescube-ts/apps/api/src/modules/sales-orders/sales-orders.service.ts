import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
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
  OrderCalculation,
  AuthUser,
} from '@salescube/shared';
import { SalesOrderService } from '@salescube/domain';
import { SalesOrdersRepository } from './sales-orders.repository';

@Injectable()
export class SalesOrdersService {
  private readonly salesOrderService = new SalesOrderService();

  constructor(private readonly repository: SalesOrdersRepository) {}

  async findAll(query: SalesOrderSearchInput): Promise<SalesOrderListResponse> {
    return this.repository.findAll(query);
  }

  async findOne(id: string): Promise<SalesOrder | null> {
    return this.repository.findOne(id);
  }

  async findByOrderNo(orderNo: string): Promise<SalesOrder | null> {
    return this.repository.findByOrderNo(orderNo);
  }

  async create(data: CreateSalesOrderInput, user: AuthUser): Promise<SalesOrder> {
    // Validate data
    const validation = this.salesOrderService.validateSalesOrderData(data);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors);
    }

    // Generate unique order number if not provided
    if (!data.orderNo) {
      const existingOrders = await this.repository.findAll({ page: 1, limit: 1000 });
      data.orderNo = this.salesOrderService.generateOrderNumber(existingOrders.rows);
    } else {
      // Check if order number already exists
      const existingOrder = await this.repository.findByOrderNo(data.orderNo);
      if (existingOrder) {
        throw new ConflictException('Mã đơn hàng đã tồn tại');
      }
    }

    // Calculate order totals
    const calculation = this.salesOrderService.calculateOrderTotals(data);

    // Update data with calculated totals
    const createData = {
      ...data,
      subtotal: calculation.subtotal,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.totalAmount,
      grossMargin: calculation.grossMargin,
      lines: data.lines.map((line, index) => ({
        ...line,
        lineSubtotal: calculation.lineCalculations[index].lineSubtotal,
        lineTax: calculation.lineCalculations[index].lineTax,
        lineTotal: calculation.lineCalculations[index].lineTotal,
      })),
    };

    return this.repository.create(createData);
  }

  async update(id: string, data: UpdateSalesOrderInput, user: AuthUser): Promise<SalesOrder> {
    // Check if order exists and can be edited
    const existingOrder = await this.repository.findOne(id);
    if (!existingOrder) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (!this.salesOrderService.canEditOrder(existingOrder.status)) {
      throw new BadRequestException('Không thể sửa đơn hàng ở trạng thái này');
    }

    // Validate data
    const validation = this.salesOrderService.validateSalesOrderData(data);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors);
    }

    // Check order number uniqueness if provided
    if (data.orderNo && data.orderNo !== existingOrder.orderNo) {
      const existingByOrderNo = await this.repository.findByOrderNo(data.orderNo);
      if (existingByOrderNo) {
        throw new ConflictException('Mã đơn hàng đã tồn tại');
      }
    }

    // Calculate totals if lines are provided
    if (data.lines) {
      const calculation = this.salesOrderService.calculateOrderTotals(data);
      
      // Update the order with calculated totals via repository
      // Use type assertion to bypass TypeScript limitations
      return this.repository.update(id, {
        ...data,
        subtotal: calculation.subtotal,
        taxAmount: calculation.taxAmount,
        totalAmount: calculation.totalAmount,
        grossMargin: calculation.grossMargin,
        lines: data.lines.map((line, index) => ({
          ...line,
          lineSubtotal: calculation.lineCalculations[index].lineSubtotal,
          lineTax: calculation.lineCalculations[index].lineTax,
          lineTotal: calculation.lineCalculations[index].lineTotal,
        })),
      } as any);
    }

    return this.repository.update(id, data);
  }

  async updateStatus(id: string, data: UpdateSalesOrderStatusInput, user: AuthUser): Promise<SalesOrder> {
    const existingOrder = await this.repository.findOne(id);
    if (!existingOrder) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    // Validate status transition
    if (!this.salesOrderService.validateStatusTransition(existingOrder.status, data.status)) {
      throw new BadRequestException(`Không thể chuyển từ trạng thái ${existingOrder.status} sang ${data.status}`);
    }

    return this.repository.updateStatus(id, data);
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const existingOrder = await this.repository.findOne(id);
    if (!existingOrder) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (!this.salesOrderService.canDeleteOrder(existingOrder.status)) {
      throw new BadRequestException('Không thể xóa đơn hàng ở trạng thái này');
    }

    return this.repository.remove(id);
  }

  // Order lines management
  async findLinesByOrderId(orderId: string): Promise<SalesOrderLine[]> {
    const order = await this.repository.findOne(orderId);
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    return this.repository.findLinesByOrderId(orderId);
  }

  async addLine(data: CreateSalesOrderLineInput, user: AuthUser): Promise<SalesOrderLine> {
    // Validate line data
    const validation = this.salesOrderService.validateSalesOrderLineData(data);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors);
    }

    // Check if order exists and can be edited
    const order = await this.repository.findOne(data.salesOrderId);
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (!this.salesOrderService.canEditOrder(order.status)) {
      throw new BadRequestException('Không thể thêm dòng cho đơn hàng ở trạng thái này');
    }

    // Calculate line totals
    const lineTotals = this.salesOrderService.calculateLineTotals(data, order.taxFraction);

    const createData = {
      ...data,
      lineSubtotal: lineTotals.lineSubtotal,
      lineTax: lineTotals.lineTax,
      lineTotal: lineTotals.lineTotal,
    };

    return this.repository.createLine(createData);
  }

  async updateLine(id: string, data: UpdateSalesOrderLineInput, user: AuthUser): Promise<SalesOrderLine> {
    // Get existing line to check order
    const existingLines = await this.repository.findLinesByOrderId('');
    const existingLine = existingLines.find(line => line.id === id);
    if (!existingLine) {
      throw new NotFoundException('Dòng đơn hàng không tồn tại');
    }

    // Check if order can be edited
    const order = await this.repository.findOne(existingLine.salesOrderId);
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (!this.salesOrderService.canEditOrder(order.status)) {
      throw new BadRequestException('Không thể sửa dòng cho đơn hàng ở trạng thái này');
    }

    // Validate line data
    const validation = this.salesOrderService.validateSalesOrderLineData(data);
    if (!validation.isValid) {
      throw new BadRequestException(validation.errors);
    }

    // Calculate line totals
    const lineTotals = this.salesOrderService.calculateLineTotals(
      { ...existingLine, ...data },
      order.taxFraction
    );

    const updateData = {
      ...data,
      lineSubtotal: lineTotals.lineSubtotal,
      lineTax: lineTotals.lineTax,
      lineTotal: lineTotals.lineTotal,
    };

    return this.repository.updateLine(id, updateData);
  }

  async removeLine(id: string, user: AuthUser): Promise<void> {
    // Get existing line to check order
    const existingLines = await this.repository.findLinesByOrderId('');
    const existingLine = existingLines.find(line => line.id === id);
    if (!existingLine) {
      throw new NotFoundException('Dòng đơn hàng không tồn tại');
    }

    // Check if order can be edited
    const order = await this.repository.findOne(existingLine.salesOrderId);
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (!this.salesOrderService.canEditOrder(order.status)) {
      throw new BadRequestException('Không thể xóa dòng cho đơn hàng ở trạng thái này');
    }

    return this.repository.removeLine(id);
  }

  // Business logic methods
  async calculateOrderTotals(data: CreateSalesOrderInput | UpdateSalesOrderInput): Promise<OrderCalculation> {
    return this.salesOrderService.calculateOrderTotals(data);
  }

  async searchSuggestions(query: string): Promise<SalesOrder[]> {
    const searchResult = await this.repository.findAll({
      page: 1,
      limit: 10,
      search: query,
    });

    return this.salesOrderService.generateOrderSuggestions(searchResult.rows, query);
  }

  async getOrderStatuses(): Promise<{ status: string; label: string }[]> {
    return [
      { status: 'DRAFT', label: 'Nháp' },
      { status: 'WAITING', label: 'Chờ duyệt' },
      { status: 'APPROVED', label: 'Đã duyệt' },
      { status: 'REJECTED', label: 'Từ chối' },
      { status: 'CLOSED', label: 'Đã đóng' },
    ];
  }

  async getSalesTypes(): Promise<{ type: string; label: string }[]> {
    return [
      { type: 'SALES', label: 'Hàng hóa' },
      { type: 'NEWS', label: 'Báo chí' },
      { type: 'WEB', label: 'Quảng cáo Web' },
    ];
  }

  async getTaxCategories(): Promise<{ category: string; label: string; rate: number }[]> {
    return [
      { category: 'STANDARD', label: '10% (Tiêu chuẩn)', rate: 0.10 },
      { category: 'REDUCED', label: '8% (Giảm)', rate: 0.08 },
      { category: 'EXEMPT', label: '0% (Miễn thuế)', rate: 0.00 },
    ];
  }

  // Helper methods
  getStatusLabel(status: string): string {
    return this.salesOrderService.getStatusLabel(status as any);
  }

  getSalesTypeLabel(salesType: string): string {
    return this.salesOrderService.getSalesTypeLabel(salesType);
  }
}
