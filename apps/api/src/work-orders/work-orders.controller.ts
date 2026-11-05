import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthUser } from '../auth/auth-user.js';
import { WorkOrdersService } from './work-orders.service.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto.js';
import { ListWorkOrdersQueryDto } from './dto/list-work-orders-query.dto.js';

@ApiTags('work-orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@ApiResponse({ status: 401, description: 'Token ausente, inválido o vencido.' })
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Orden creada.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(user.sub, dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Listado de mis órdenes.' })
  @ApiResponse({ status: 400, description: 'Parámetros skip/take inválidos.' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: ListWorkOrdersQueryDto,
  ) {
    return this.workOrdersService.findAll(user.sub, query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Orden encontrada.' })
  @ApiResponse({
    status: 404,
    description: 'No existe o pertenece a otra cuenta.',
  })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.workOrdersService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Orden actualizada.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({
    status: 404,
    description: 'No existe o pertenece a otra cuenta.',
  })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Orden eliminada.' })
  @ApiResponse({
    status: 404,
    description: 'No existe o pertenece a otra cuenta.',
  })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.workOrdersService.remove(user.sub, id);
  }
}
