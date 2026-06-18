import { Injectable } from '@nestjs/common';
import type { Prisma } from '@salescube/db';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
  }

  findByCode(code: string) {
    return this.prisma.customer.findFirst({
      where: { code, deletedAt: null },
    });
  }

  async search(params: {
    q?: string;
    skip: number;
    take: number;
  }): Promise<{ rows: Awaited<ReturnType<PrismaService['customer']['findMany']>>; total: number }> {
    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
    };

    if (params.q) {
      const q = params.q;
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { nameKana: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { abbr: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { code: 'asc' },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { rows, total };
  }

  create(data: Prisma.CustomerCreateInput) {
    return this.prisma.customer.create({ data });
  }

  update(id: string, data: Prisma.CustomerUpdateInput) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  softDelete(id: string, userId?: string) {
    return this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId ?? null },
    });
  }
}
