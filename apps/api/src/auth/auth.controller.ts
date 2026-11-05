import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import type { AuthUser } from './auth-user.js';

const badRequest = {
  status: 400,
  description: 'Datos inválidos: el cuerpo no cumple las validaciones.',
  schema: {
    example: {
      message: ['password must be longer than or equal to 15 characters'],
      error: 'Bad Request',
      statusCode: 400,
    },
  },
};

const tooManyRequests = {
  status: 429,
  description: 'Demasiados intentos: máximo 10 por minuto por ruta e IP.',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @UseGuards(ThrottlerGuard)
  @Header('Cache-Control', 'no-store')
  @ApiResponse({ status: 201, description: 'Cuenta creada y token emitido.' })
  @ApiResponse(badRequest)
  @ApiResponse({ status: 409, description: 'Correo registrado.' })
  @ApiResponse(tooManyRequests)
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Header('Cache-Control', 'no-store')
  @ApiResponse({ status: 200, description: 'Token emitido.' })
  @ApiResponse(badRequest)
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  @ApiResponse(tooManyRequests)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Header('Cache-Control', 'no-store')
  @ApiResponse({ status: 200, description: 'Identidad de la cuenta activa.' })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido o vencido.',
  })
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
