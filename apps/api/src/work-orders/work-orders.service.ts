import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import type { ListWorkOrdersQueryDto } from './dto/list-work-orders-query.dto.js';
import type { UpdateWorkOrderDto } from './dto/update-work-order.dto.js';

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, dto: CreateWorkOrderDto) {
    return this.prisma.workOrder.create({
      data: {
        title: dto.title,
        vehiclePlate: dto.vehiclePlate,
        estimatedCost: dto.estimatedCost,
        status: dto.status,
        ownerId,
      },
    });
  }

  findAll(ownerId: string, query: ListWorkOrdersQueryDto) {
    return this.prisma.workOrder.findMany({
      where: { ownerId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: query.skip,
      take: query.take,
    });
  }

  async findOne(ownerId: string, id: string) {
    const order = await this.prisma.workOrder.findFirst({
      where: { id, ownerId },
    });
    if (!order) throw new NotFoundException('Orden de trabajo no encontrada.');
    return order;
  }

  async update(ownerId: string, id: string, dto: UpdateWorkOrderDto) {
    try {
      return await this.prisma.workOrder.update({
        where: { id, ownerId },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Orden de trabajo no encontrada.');
      }
      throw error;
    }
  }

  async remove(ownerId: string, id: string) {
    try {
      await this.prisma.workOrder.delete({ where: { id, ownerId } });
      return { ok: true, id };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Orden de trabajo no encontrada.');
      }
      throw error;
    }
  }
}