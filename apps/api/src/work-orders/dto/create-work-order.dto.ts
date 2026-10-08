// valida datos de entrada para crear una orden de trabajo
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Priority } from '../../generated/prisma/enums.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateWorkOrderDto {
  @ApiProperty({ example: 'Cambio de pastillas de freno' })
  @Transform(trim)
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título no puede estar vacío' })
  @MaxLength(200, { message: 'El título no puede superar los 200 caracteres' })
  title!: string;

  @ApiPropertyOptional({
    example: 'Cliente reporta ruido al frenar',
    nullable: true,
  })
  @Transform(trim)
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(2000, {
    message: 'La descripción no puede superar los 2000 caracteres',
  })
  description?: string | null;

  @ApiPropertyOptional({
    enum: Priority,
    enumName: 'Priority',
    default: Priority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(Priority, {
    message: 'La prioridad debe ser LOW, MEDIUM o HIGH',
  })
  priority?: Priority;

  @ApiProperty({ example: 'ABCD12', description: 'AAAA11 o AA1111' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString({ message: 'La patente debe ser texto' })
  @Matches(/^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/, {
    message: 'Patente inválida (ej: ABCD12 o AB1234)',
  })
  vehiclePlate!: string;

  @ApiPropertyOptional({ default: 0, minimum: 0, example: 45000 })
  @IsOptional()
  @IsInt({ message: 'El costo estimado debe ser un número entero' })
  @Min(0, { message: 'El costo estimado no puede ser negativo' })
  @Max(100000000, {
    message: 'El costo estimado no puede superar 100.000.000',
  })
  estimatedCost?: number;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-10-15T18:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha límite debe tener formato ISO 8601 (ej: 2026-10-15T18:00:00.000Z)',
    },
  )
  dueDate?: string | null;
}
