import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { Priority, WorkOrderStatus } from '../src/generated/prisma/enums.js';

const connectionString = process.env.DATABASE_URL;
const demoOwnerId = process.env.DEMO_OWNER_ID;

if (!connectionString) throw new Error('DATABASE_URL no está definida');
if (!demoOwnerId) throw new Error('DEMO_OWNER_ID no está definida');

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

try {
  const demoUser = await prisma.user.upsert({
    where: { id: demoOwnerId },
    update: { email: 'demo@taller.local', name: 'Usuario de demostración' },
    create: {
      id: demoOwnerId,
      email: 'demo@taller.local',
      name: 'Usuario de demostración',
      passwordHash: 'DEMO_ONLY_NO_LOGIN',
    },
  });
  console.log(`Usuario de demostración disponible: ${demoUser.id}`);

  const existing = await prisma.workOrder.count({
    where: { ownerId: demoOwnerId },
  });

  if (existing === 0) {
    const o = demoOwnerId;
    await prisma.workOrder.createMany({
      data: [
        {
          title: 'Cambio de pastillas de freno',
          vehiclePlate: 'ABCD12',
          priority: Priority.HIGH,
          status: WorkOrderStatus.IN_REPAIR,
          estimatedCost: 45000,
          dueDate: new Date('2026-10-12T18:00:00.000Z'),
          ownerId: o,
        },
        {
          title: 'Mantención de 20.000 km',
          vehiclePlate: 'EFGH34',
          priority: Priority.MEDIUM,
          status: WorkOrderStatus.RECEIVED,
          estimatedCost: 80000,
          dueDate: new Date('2026-10-14T18:00:00.000Z'),
          ownerId: o,
        },
        {
          title: 'Alineación y balanceo',
          vehiclePlate: 'JKLM56',
          priority: Priority.LOW,
          status: WorkOrderStatus.READY,
          estimatedCost: 30000,
          ownerId: o,
        },
        {
          title: 'Diagnóstico de luz check engine',
          description: 'Cliente reporta pérdida de potencia',
          vehiclePlate: 'NPQR78',
          priority: Priority.HIGH,
          status: WorkOrderStatus.RECEIVED,
          estimatedCost: 25000,
          ownerId: o,
        },
        {
          title: 'Cambio de batería',
          vehiclePlate: 'ST1234',
          priority: Priority.MEDIUM,
          status: WorkOrderStatus.DELIVERED,
          estimatedCost: 70000,
          ownerId: o,
        },
        {
          title: 'Reparación de sistema eléctrico',
          vehiclePlate: 'VWXY90',
          priority: Priority.HIGH,
          status: WorkOrderStatus.IN_REPAIR,
          estimatedCost: 120000,
          dueDate: new Date('2026-10-20T18:00:00.000Z'),
          ownerId: o,
        },
      ],
    });
    console.log('Órdenes de ejemplo creadas: 6');
  } else {
    console.log(`El usuario ya tiene ${existing} órdenes; no se agregan más.`);
  }
} finally {
  await prisma.$disconnect();
}
