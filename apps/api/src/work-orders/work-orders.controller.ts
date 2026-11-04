import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service.js';
import { CreateWorkOrderDto } from './dto/create-work-order.dto.js';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto.js';
import { ListWorkOrdersQueryDto } from './dto/list-work-orders-query.dto.js';

const DEMO_OWNER_ID = '00000000-0000-0000-0000-000000000000';

@ApiTags('work-orders')
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(DEMO_OWNER_ID, dto);
  }

  @Get()
  findAll(@Query() query: ListWorkOrdersQueryDto) {
    return this.workOrdersService.findAll(DEMO_OWNER_ID, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(DEMO_OWNER_ID, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(DEMO_OWNER_ID, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workOrdersService.remove(DEMO_OWNER_ID, id);
  }
}