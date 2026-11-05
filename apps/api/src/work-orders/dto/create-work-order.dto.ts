import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { WorkOrderStatus } from '../../generated/prisma/client.js';

// Patente chilena: ABCD12 (formato actual) o AB1234 (formato antiguo).
export const PLATE_PATTERN = /^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/;

export class CreateWorkOrderDto {
  @ApiProperty({ example: 'Cambio de aceite', minLength: 1, maxLength: 200 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(1, 200, { message: 'El título debe tener entre 1 y 200 caracteres' })
  title!: string;

  @ApiPropertyOptional({
    type: String,
    maxLength: 500,
    nullable: true,
    example: 'Revisar ruido en el tren delantero',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'La descripción no puede superar los 500 caracteres',
  })
  description?: string | null;

  @ApiProperty({ example: 'ABCD12', description: 'Formato ABCD12 o AB1234' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Matches(PLATE_PATTERN, {
    message: 'La patente debe tener formato ABCD12 o AB1234',
  })
  vehiclePlate!: string;

  @ApiProperty({ example: 45000, minimum: 0, maximum: 2147483647 })
  @IsInt({ message: 'El costo estimado debe ser un número entero' })
  @Min(0)
  @Max(2147483647)
  estimatedCost!: number;

  @ApiPropertyOptional({
    enum: WorkOrderStatus,
    default: WorkOrderStatus.RECEIVED,
  })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;
}
