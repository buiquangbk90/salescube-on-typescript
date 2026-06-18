import type {
  SalesOrder,
  SalesOrderLine,
  CreateSalesOrderInput,
  UpdateSalesOrderInput,
  CreateSalesOrderLineInput,
  UpdateSalesOrderLineInput,
  OrderCalculation,
  SlipStatus,
  SalesOrderTaxShift,
  SalesOrderFraction,
  SalesOrderTaxCategory,
} from '@salescube/shared';
import { PriceCalculator } from '../product/price-calculator';

export class SalesOrderService {
  /**
   * Validate sales order data before creation/update
   */
  validateSalesOrderData(data: CreateSalesOrderInput | UpdateSalesOrderInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!data.customerId) {
      errors.push('Khách hàng không được để trống');
    }

    if (!data.orderDate) {
      errors.push('Ngày đặt hàng không được để trống');
    }

    if (data.deliveryDate && data.orderDate && new Date(data.deliveryDate) < new Date(data.orderDate)) {
      errors.push('Ngày giao hàng không thể trước ngày đặt hàng');
    }

    // Lines validation
    if (data.lines && data.lines.length > 0) {
      data.lines.forEach((line, index) => {
        if (!line.productName) {
          errors.push(`Dòng ${index + 1}: Tên sản phẩm không được để trống`);
        }
        if (!line.quantity || line.quantity <= 0) {
          errors.push(`Dòng ${index + 1}: Số lượng phải lớn hơn 0`);
        }
        if (line.unitPrice !== undefined && line.unitPrice < 0) {
          errors.push(`Dòng ${index + 1}: Đơn giá phải lớn hơn hoặc bằng 0`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate unique order number
   */
  generateOrderNumber(existingOrders: SalesOrder[]): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const prefix = `SO${year}${month}${day}`;
    
    // Find existing orders with same prefix
    const existingNumbers = existingOrders
      .filter(order => order.orderNo.startsWith(prefix))
      .map(order => {
        const suffix = order.orderNo.replace(prefix, '');
        return parseInt(suffix) || 0;
      })
      .filter(num => !isNaN(num));

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Calculate order totals and line calculations
   */
  calculateOrderTotals(data: CreateSalesOrderInput | UpdateSalesOrderInput): OrderCalculation {
    if (!data.lines || data.lines.length === 0) {
      return {
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        lineCalculations: [],
      };
    }

    const lineCalculations = data.lines.map((line, index) => {
      const lineSubtotal = line.quantity * line.unitPrice;
      const taxRate = this.getTaxRate(line.taxCategory || 'STANDARD');
      const lineTax = PriceCalculator.calculateTax(lineSubtotal, line.taxCategory || 'STANDARD');
      const lineTotal = lineSubtotal + lineTax;

      return {
        lineNo: index + 1,
        lineSubtotal,
        lineTax,
        lineTotal,
      };
    });

    const subtotal = lineCalculations.reduce((sum, calc) => sum + calc.lineSubtotal, 0);
    const taxAmount = lineCalculations.reduce((sum, calc) => sum + calc.lineTax, 0);
    const totalAmount = subtotal + taxAmount;

    // Calculate gross margin if cost prices are available
    const grossMargin = data.lines.some(line => line.unitCost !== undefined)
      ? data.lines.reduce((sum, line) => {
          const lineRevenue = line.quantity * line.unitPrice;
          const lineCost = line.quantity * (line.unitCost || 0);
          return sum + (lineRevenue - lineCost);
        }, 0)
      : undefined;

    return {
      subtotal,
      taxAmount,
      totalAmount,
      grossMargin,
      lineCalculations,
    };
  }

  /**
   * Get tax rate based on tax category
   */
  private getTaxRate(taxCategory: SalesOrderTaxCategory): number {
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

  /**
   * Validate order status transition
   */
  validateStatusTransition(currentStatus: SlipStatus, newStatus: SlipStatus): boolean {
    const validTransitions: Record<SlipStatus, SlipStatus[]> = {
      'DRAFT': ['WAITING', 'APPROVED', 'REJECTED', 'CLOSED'],
      'WAITING': ['APPROVED', 'REJECTED', 'CLOSED'],
      'APPROVED': ['CLOSED'],
      'REJECTED': ['DRAFT', 'CLOSED'],
      'CLOSED': [], // Closed orders cannot be changed
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Check if order can be edited
   */
  canEditOrder(status: SlipStatus): boolean {
    return ['DRAFT', 'WAITING', 'REJECTED'].includes(status);
  }

  /**
   * Check if order can be deleted
   */
  canDeleteOrder(status: SlipStatus): boolean {
    return ['DRAFT', 'REJECTED'].includes(status);
  }

  /**
   * Get order status display label
   */
  getStatusLabel(status: SlipStatus): string {
    const labels: Record<SlipStatus, string> = {
      'DRAFT': 'Nháp',
      'WAITING': 'Chờ duyệt',
      'APPROVED': 'Đã duyệt',
      'REJECTED': 'Từ chối',
      'CLOSED': 'Đã đóng',
    };
    return labels[status] || status;
  }

  /**
   * Get sales type display label
   */
  getSalesTypeLabel(salesType: string): string {
    const labels: Record<string, string> = {
      'SALES': 'Hàng hóa',
      'NEWS': 'Báo chí',
      'WEB': 'Quảng cáo Web',
    };
    return labels[salesType] || salesType;
  }

  /**
   * Generate sales order suggestions based on search query
   */
  generateOrderSuggestions(orders: SalesOrder[], query: string): SalesOrder[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return orders
      .filter(order => 
        order.orderNo.toLowerCase().includes(lowerQuery) ||
        order.customerNameSnapshot.toLowerCase().includes(lowerQuery) ||
        order.customerCodeSnapshot.toLowerCase().includes(lowerQuery) ||
        (order.remarks && order.remarks.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 10); // Limit suggestions
  }

  /**
   * Validate sales order line data
   */
  validateSalesOrderLineData(data: CreateSalesOrderLineInput | UpdateSalesOrderLineInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.productName) {
      errors.push('Tên sản phẩm không được để trống');
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.push('Số lượng phải lớn hơn 0');
    }

    if (data.unitPrice !== undefined && data.unitPrice < 0) {
      errors.push('Đơn giá phải lớn hơn hoặc bằng 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate line totals
   */
  calculateLineTotals(line: CreateSalesOrderLineInput | UpdateSalesOrderLineInput, taxFraction: SalesOrderFraction = 'FLOOR') {
    const quantity = line.quantity || 0;
    const unitPrice = line.unitPrice || 0;
    const lineSubtotal = quantity * unitPrice;
    const taxRate = this.getTaxRate(line.taxCategory || 'STANDARD');
    const lineTax = PriceCalculator.calculateTax(lineSubtotal, line.taxCategory || 'STANDARD');
    const lineTotal = lineSubtotal + lineTax;

    return {
      lineSubtotal,
      lineTax,
      lineTotal,
    };
  }
}
