import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { WorkOrdersModule } from './work-orders/work-orders.module.js';

@Module({
  imports: [PrismaModule, WorkOrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
