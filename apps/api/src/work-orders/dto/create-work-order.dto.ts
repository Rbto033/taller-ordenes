import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { WorkOrderStatus } from '../../generated/prisma/client.js';

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

  @ApiPropertyOptional({ enum: WorkOrderStatus, default: WorkOrderStatus.RECEIVED })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;
}