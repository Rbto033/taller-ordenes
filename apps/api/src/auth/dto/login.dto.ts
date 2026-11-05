import { Transform } from 'class-transformer';
import {
  IsByteLength,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'alicia@example.test', maxLength: 254 })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  email!: string;

  // En el login no se aplica el mínimo de 15: no debe bloquear cuentas antiguas.
  @ApiProperty({ writeOnly: true, maxLength: 72 })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  @IsByteLength(1, 72)
  password!: string;
}
