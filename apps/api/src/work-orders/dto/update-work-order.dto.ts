// valida datos de entrada para actualizar una orden de trabajo
import { ApiPropertyOptional } from '@nestjs/swagger';
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
  ValidateIf,
} from 'class-validator';
import { WorkOrderStatus } from '../../generated/prisma/enums.js';
import { PLATE_PATTERN } from './create-work-order.dto.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Los campos son opcionales, pero si vienen no pueden ser null.
// (PartialType usaría IsOptional, que dejaría pasar title: null.)
export class UpdateWorkOrderDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 200 })
  @Transform(trim)
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(1, 200, { message: 'El título debe tener entre 1 y 200 caracteres' })
  title?: string;

  @ApiPropertyOptional({ type: String, maxLength: 500, nullable: true })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'La descripción no puede superar los 500 caracteres',
  })
  description?: string | null;

  @ApiPropertyOptional({ example: 'ABCD12' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(PLATE_PATTERN, {
    message: 'La patente debe tener formato ABCD12 o AB1234',
  })
  vehiclePlate?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 2147483647 })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt({ message: 'El costo estimado debe ser un número entero' })
  @Min(0)
  @Max(2147483647)
  estimatedCost?: number;

  @ApiPropertyOptional({
    enum: WorkOrderStatus,
    enumName: 'WorkOrderStatus',
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(WorkOrderStatus, {
    message: 'El estado debe ser RECEIVED, IN_REPAIR, READY o DELIVERED',
  })
  status?: WorkOrderStatus;
}
