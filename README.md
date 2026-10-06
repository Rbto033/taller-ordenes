# Taller Órdenes

API REST para gestionar órdenes de trabajo de un taller mecánico.
Proyecto de Programación Back-End, Evaluación 1.

## Problema

Los talleres pequeños suelen llevar las órdenes en cuadernos o mensajes, y se pierde
el seguimiento del estado de cada vehículo. Esta API centraliza las órdenes de trabajo
con su prioridad, estado, fecha comprometida y costo estimado.

## Stack

NestJS 12 (ESM) · Prisma ORM 7 · PostgreSQL 18 en Docker · Swagger/OpenAPI · pnpm workspaces

## Requisitos

Node 24 LTS, pnpm 12.2.1, Git y Docker Desktop.

## Puesta en marcha

```powershell
# 1. Variables de entorno
Copy-Item infra/.env.example infra/.env
Copy-Item apps/api/.env.example apps/api/.env

# 2. Dependencias y base de datos
pnpm install
docker compose --env-file infra/.env -f infra/compose.yaml up -d

# 3. Prisma
Set-Location apps/api
pnpm exec prisma migrate deploy
pnpm exec prisma generate
pnpm exec prisma db seed
Set-Location ../..

# 4. API
pnpm dev:api
```

Swagger: http://localhost:3000/api/docs

## Equipo

| Integrante        |
| ----------------- |
| Roberto Robles    |
| Francisco Chandia |
| Ruth Navarro      |
