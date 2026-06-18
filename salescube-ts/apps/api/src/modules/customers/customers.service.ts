import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateCustomerInput, UpdateCustomerInput } from '@salescube/shared';
import { normalizeCompanyName } from '@salescube/domain';
import { CustomersRepository } from './customers.repository';

@Injectable()
export class CustomersService {
  constructor(private readonly repo: CustomersRepository) {}

  async findAll(params: { q?: string; page: number; pageSize: number }) {
    const { rows, total } = await this.repo.search({
      q: params.q,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    });
    return { data: rows, total, page: params.page, pageSize: params.pageSize };
  }

  async findOne(id: string) {
    const customer = await this.repo.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(input: CreateCustomerInput, userId?: string) {
    const existing = await this.repo.findByCode(input.code);
    if (existing) {
      throw new ConflictException(`Customer code "${input.code}" already exists`);
    }

    return this.repo.create({
      ...input,
      name: normalizeCompanyName(input.name),
      createdBy: userId,
      updatedBy: userId,
    });
  }

  async update(id: string, input: UpdateCustomerInput, userId?: string) {
    await this.findOne(id); // throws if not found
    const data = { ...input, updatedBy: userId };
    if (input.name) data.name = normalizeCompanyName(input.name);
    return this.repo.update(id, data);
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);
    return this.repo.softDelete(id, userId);
  }
}
