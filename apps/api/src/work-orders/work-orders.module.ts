// el mudule es para agrupar el controlador y el servicio de órdenes de trabajo en un solo módulo
import { Module } from '@nestjs/common';
import { WorkOrdersController } from './work-orders.controller.js';
import { WorkOrdersRepository } from './work-orders.repository.js';
import { WorkOrdersService } from './work-orders.service.js';

@Module({
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService, WorkOrdersRepository],
})
export class WorkOrdersModule {}
