import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { WorkOrderPriority, WorkOrderStatus } from '../../generated/prisma/client.js';

export class CreateWorkOrderDto {
  @ApiProperty({ example: 'Cambio de aceite' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'AB123CD' })
  @IsString()
  vehiclePlate!: string;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  @Min(0)
  estimatedCost!: number;

  @ApiPropertyOptional({ enum: WorkOrderPriority, default: WorkOrderPriority.MEDIUM })
  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @ApiPropertyOptional({ enum: WorkOrderStatus, default: WorkOrderStatus.PENDING })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;
}