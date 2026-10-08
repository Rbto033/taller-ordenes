// recibe la petición del cliente y llama al servicio para procesarla
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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { ListWorkOrdersQueryDto } from './dto/list-work-orders-query.dto.js';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto.js';
import { WorkOrdersService } from './work-orders.service.js';

@ApiTags('work-orders')
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una orden de trabajo' })
  @ApiCreatedResponse({ description: 'Orden creada' })
  @ApiBadRequestResponse({ description: 'Cuerpo inválido' })
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar órdenes de trabajo' })
  @ApiOkResponse({ description: 'Listado paginado' })
  @ApiBadRequestResponse({ description: 'Paginación inválida' })
  findAll(@Query() query: ListWorkOrdersQueryDto) {
    return this.workOrdersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una orden por UUID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Orden encontrada' })
  @ApiBadRequestResponse({ description: 'UUID inválido' })
  @ApiNotFoundResponse({ description: 'Orden no encontrada' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente una orden' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Orden actualizada' })
  @ApiBadRequestResponse({ description: 'UUID o cuerpo inválido' })
  @ApiNotFoundResponse({ description: 'Orden no encontrada' })
  @ApiConflictResponse({ description: 'Transición de estado no permitida' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una orden' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Orden eliminada' })
  @ApiBadRequestResponse({ description: 'UUID inválido' })
  @ApiNotFoundResponse({ description: 'Orden no encontrada' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.workOrdersService.remove(id);
  }
}
