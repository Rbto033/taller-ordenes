import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class ListWorkOrdersQueryDto {
  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @Type(() => Number)
  @IsInt({ message: 'skip debe ser un número entero' })
  @Min(0, { message: 'skip no puede ser negativo' })
  skip = 0;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt({ message: 'take debe ser un número entero' })
  @Min(1, { message: 'take debe ser al menos 1' })
  @Max(100, { message: 'take no puede ser mayor que 100' })
  take = 20;
}
