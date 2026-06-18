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
  createCustomerSchema,
  customerSearchSchema,
  updateCustomerSchema,
  type AuthUser,
  type CreateCustomerInput,
  type CustomerSearchInput,
  type UpdateCustomerInput,
} from '@salescube/shared';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { CurrentUser, Public, RequirePermissions } from '../auth/decorators';
import { RolesGuard } from '../auth/roles.guard';
import { CustomersService } from './customers.service';

@Controller('customers')
@Public()
export class CustomersController {
  constructor() {
    console.log('CustomersController constructor called - no dependencies');
  }

  @Get()
  @RequirePermissions('customer.read')
  @UsePipes(new ZodValidationPipe(customerSearchSchema))
  list(@Query() query: CustomerSearchInput) {
    console.log('CustomersController.list called with mock implementation');
    
    // Mock response for testing
    return {
      rows: [
        {
          id: 'mock-customer-1',
          code: 'CUST001',
          name: 'Mock Customer 1',
          nameKana: 'モックカスタマー1',
          email: 'customer1@example.com',
          phone: '03-1234-5678',
          address: 'Tokyo, Japan',
          taxRateId: 'tax-rate-1',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      total: 1,
    };
  }

  @Get(':id')
  @RequirePermissions('customer.read')
  findOne(@Param('id') id: string) {
    console.log('CustomersController.findOne called with mock implementation');
    
    return {
      id: id,
      code: 'CUST001',
      name: 'Mock Customer 1',
      nameKana: 'モックカスタマー1',
      email: 'customer1@example.com',
      phone: '03-1234-5678',
      address: 'Tokyo, Japan',
      taxRateId: 'tax-rate-1',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Post()
  @RequirePermissions('customer.write')
  @HttpCode(201)
  create(
    @Body(new ZodValidationPipe(createCustomerSchema)) body: CreateCustomerInput,
  ) {
    console.log('CustomersController.create called with mock implementation');
    
    return {
      id: 'new-customer-id',
      ...body,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @RequirePermissions('customer.write')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCustomerSchema)) body: UpdateCustomerInput,
  ) {
    console.log('CustomersController.update called with mock implementation');
    
    return {
      id: id,
      code: 'CUST001',
      name: 'Mock Customer 1',
      nameKana: 'モックカスタマー1',
      email: 'customer1@example.com',
      phone: '03-1234-5678',
      address: 'Tokyo, Japan',
      taxRateId: 'tax-rate-1',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body,
    };
  }

  @Delete(':id')
  @RequirePermissions('customer.delete')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    console.log('CustomersController.remove called with mock implementation');
    // Mock successful deletion
  }
}
