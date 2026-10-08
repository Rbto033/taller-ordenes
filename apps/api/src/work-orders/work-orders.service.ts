// aplica la lógica de negocio para gestionar las órdenes de trabajo
import 'dotenv/config';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkOrderStatus } from '../generated/prisma/enums.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { ListWorkOrdersQueryDto } from './dto/list-work-orders-query.dto.js';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto.js';
import { WorkOrdersRepository } from './work-orders.repository.js';

const ALLOWED_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  RECEIVED: ['IN_REPAIR'],
  IN_REPAIR: ['READY'],
  READY: ['DELIVERED'],
  DELIVERED: [],
};

@Injectable()
export class WorkOrdersService {
  private readonly ownerId: string;

  constructor(private readonly repository: WorkOrdersRepository) {
    const ownerId = process.env.DEMO_OWNER_ID;
    if (!ownerId) {
      throw new Error('DEMO_OWNER_ID no está definida');
    }
    this.ownerId = ownerId;
  }

  create(dto: CreateWorkOrderDto) {
    const { dueDate, ...data } = dto;
    return this.repository.create({
      ...data,
      ownerId: this.ownerId,
      ...(dueDate !== undefined
        ? { dueDate: dueDate === null ? null : new Date(dueDate) }
        : {}),
    });
  }

  findAll(query: ListWorkOrdersQueryDto) {
    return this.repository.findMany(this.ownerId, query.skip, query.take);
  }

  async findOne(id: string) {
    //validación de existencia de la orden antes de actualizarla o eliminarla
    const order = await this.repository.findOne(id, this.ownerId);
    if (!order) {
      throw new NotFoundException('Orden de trabajo no encontrada');
    }
    return order;
  }

  async update(id: string, dto: UpdateWorkOrderDto) {
    //validación de actualización de estado
    const current = await this.findOne(id);

    if (
      dto.status !== undefined &&
      dto.status !== current.status &&
      !ALLOWED_TRANSITIONS[current.status].includes(dto.status)
    ) {
      throw new ConflictException(
        `No se puede pasar de ${current.status} a ${dto.status}`,
      );
    }

    const { dueDate, ...data } = dto;
    return this.repository.update(id, this.ownerId, {
      ...data,
      ...(dueDate !== undefined
        ? { dueDate: dueDate === null ? null : new Date(dueDate) }
        : {}),
    });
  }

  async remove(id: string) {
    //validación de existencia de la orden antes de eliminarla
    await this.findOne(id);
    await this.repository.delete(id, this.ownerId);
    return { ok: true, id };
  }
}
