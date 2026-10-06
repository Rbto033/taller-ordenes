import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WorkOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.WorkOrderUncheckedCreateInput) {
    return this.prisma.workOrder.create({ data });
  }

  findMany(ownerId: string, skip: number, take: number) {
    return this.prisma.workOrder.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  findOne(id: string, ownerId: string) {
    return this.prisma.workOrder.findFirst({ where: { id, ownerId } });
  }

  update(id: string, ownerId: string, data: Prisma.WorkOrderUpdateInput) {
    return this.prisma.workOrder.update({ where: { id, ownerId }, data });
  }

  delete(id: string, ownerId: string) {
    return this.prisma.workOrder.delete({ where: { id, ownerId } });
  }
}
