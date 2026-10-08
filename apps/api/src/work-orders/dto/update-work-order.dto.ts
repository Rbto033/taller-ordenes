// valida datos de entrada para actualizar una orden de trabajo
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { WorkOrderStatus } from '../../generated/prisma/enums.js';
import { CreateWorkOrderDto } from './create-work-order.dto.js';

export class UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto) {
  @ApiPropertyOptional({
    enum: WorkOrderStatus,
    enumName: 'WorkOrderStatus',
  })
  @IsOptional()
  @IsEnum(WorkOrderStatus, {
    message: 'El estado debe ser RECEIVED, IN_REPAIR, READY o DELIVERED',
  })
  status?: WorkOrderStatus;
}
