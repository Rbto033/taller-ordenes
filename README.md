# Taller Órdenes

Aplicación web para gestionar órdenes de trabajo de un taller mecánico: API REST
(NestJS + PostgreSQL) y una interfaz React con registro, inicio de sesión y órdenes
privadas por cuenta.

Proyecto de Desarrollo de Aplicaciones Web II, Evaluación 2 (segundo avance).

## Problema

Los talleres pequeños suelen llevar las órdenes en cuadernos o mensajes, y se pierde
el seguimiento del estado de cada vehículo. Esta aplicación centraliza las órdenes de
trabajo con su estado, prioridad y costo estimado. Cada cuenta ve y modifica
únicamente sus propias órdenes.

## Stack

NestJS 12 (ESM) · Prisma ORM 7 · PostgreSQL 18 en Docker · Passport JWT · bcrypt ·
Swagger/OpenAPI · React 19 · Vite 8 · TanStack Query 5 · Axios · React Router 7 ·
pnpm workspaces

## Estructura

```
apps/api     API REST (NestJS, Prisma, autenticación JWT)
apps/web     Interfaz React (Vite)
infra        Docker Compose de PostgreSQL
```

## Requisitos

Node 24 LTS, pnpm 12.2.1, Git y Docker Desktop.

## Instalación y puesta en marcha

Los comandos son de PowerShell y se ejecutan desde la raíz del repositorio.

### 1. Variables de entorno

Cada `.env` es local y está ignorado por Git. Los `.env.example` sí se versionan.

```powershell
Copy-Item infra/.env.example infra/.env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Genera el secreto JWT y pégalo como valor de `JWT_SECRET` en `apps/api/.env`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

| Archivo            | Variable          | Descripción                                                             |
| ------------------ | ----------------- | ----------------------------------------------------------------------- |
| `infra/.env`       | `POSTGRES_*`      | Usuario, contraseña, base y puerto (5433) del contenedor.               |
| `apps/api/.env`    | `DATABASE_URL`    | Debe coincidir con los valores de `infra/.env`.                         |
| `apps/api/.env`    | `PORT`            | Puerto de la API (3000).                                                |
| `apps/api/.env`    | `WEB_ORIGIN`      | Origen permitido por CORS (`http://localhost:5173`).                    |
| `apps/api/.env`    | `JWT_SECRET`      | Secreto de al menos 32 bytes. Sin valor predeterminado; la API no inicia sin él. |
| `apps/api/.env`    | `JWT_EXPIRES_IN`  | Vigencia del token en segundos, entre 60 y 3600 (900 = 15 min).         |
| `apps/web/.env`    | `VITE_API_URL`    | Origen público de la API. Es visible en el navegador: nunca pongas secretos aquí. |

Si cambias un `.env`, reinicia el proceso correspondiente (NestJS o Vite).

### 2. Dependencias y base de datos

```powershell
pnpm install
docker compose --env-file infra/.env -f infra/compose.yaml up -d
Set-Location apps/api
pnpm exec prisma migrate deploy
pnpm exec prisma generate
pnpm exec prisma db seed
Set-Location ../..
```

### 3. Iniciar la API y la web

```powershell
pnpm dev        # API y web a la vez
# o por separado, en dos terminales:
pnpm dev:api
pnpm dev:web
```

| Qué                   | Dirección                        |
| --------------------- | -------------------------------- |
| Interfaz web          | http://localhost:5173            |
| API                   | http://localhost:3000            |
| Swagger (documentación) | http://localhost:3000/api/docs |

## Uso de la interfaz

1. Abre http://localhost:5173 y pulsa **Necesito crear una cuenta**. La contraseña
   necesita al menos 15 caracteres.
2. Crea órdenes con título, patente (`ABCD12` o `AB1234`), costo y descripción opcional.
3. El listado muestra 20 órdenes por página; usa **Anterior** y **Siguiente**.
4. **Cerrar sesión** retira el token y los datos privados de la pantalla.

Recargar la página termina la sesión: el token vive solo en memoria. Las cuentas y
órdenes permanecen en PostgreSQL.

## API

Documentación interactiva en `/api/docs`. Para probar rutas protegidas en Swagger,
ejecuta `POST /auth/signup` o `POST /auth/login`, pulsa **Authorize** y pega el
`access_token` (sin la palabra `Bearer`).

| Método | Ruta               | Protegida | Descripción                              |
| ------ | ------------------ | --------- | ---------------------------------------- |
| POST   | `/auth/signup`     | No        | Crea una cuenta y emite un token (201).  |
| POST   | `/auth/login`      | No        | Emite un token (200) o responde 401.     |
| GET    | `/auth/me`         | Sí        | Identidad pública de la cuenta activa.   |
| POST   | `/work-orders`     | Sí        | Crea una orden de la cuenta activa.      |
| GET    | `/work-orders`     | Sí        | Lista sus órdenes (`skip`, `take` ≤ 100).|
| GET    | `/work-orders/:id` | Sí        | Consulta una orden propia.               |
| PATCH  | `/work-orders/:id` | Sí        | Modifica una orden propia.               |
| DELETE | `/work-orders/:id` | Sí        | Elimina una orden propia.                |

Registro y login limitan a 10 solicitudes por minuto por ruta e IP; la siguiente
devuelve 429.

## Pruebas y controles de calidad

```powershell
pnpm format:check
pnpm --filter @taller/api exec prisma validate --config prisma7.config.ts
pnpm --filter @taller/api run prisma:generate
pnpm --filter @taller/api lint
pnpm --filter @taller/api test
pnpm --filter @taller/api exec node --test checks/auth-settings.check.mjs
pnpm --filter @taller/api build
pnpm --filter @taller/web lint
pnpm --filter @taller/web test
pnpm --filter @taller/web build
```

Prueba HTTP real con dos cuentas (requiere la API iniciada y PostgreSQL encendido):

```powershell
pnpm --filter @taller/api exec node checks/auth-smoke.mjs
```

El script registra dos cuentas, comprueba duplicados (409), credenciales incorrectas
(401), aislamiento entre cuentas (404), entradas inválidas (400) y tokens vencidos,
alterados, de otro emisor, audiencia o algoritmo (401). Espera 34 comprobaciones
correctas y borra las órdenes que crea. Solo funciona contra una API local. Si aparece
429 porque hiciste muchas pruebas, espera un minuto y repite.

Límite de intentos (diez 401 y un 429, en una ventana limpia de un minuto):

```powershell
1..11 | ForEach-Object {
  try {
    (Invoke-WebRequest -UseBasicParsing -ErrorAction Stop -Uri 'http://localhost:3000/auth/login' `
      -Method POST -ContentType 'application/json' `
      -Body '{"email":"no-existe@example.test","password":"Incorrecta-2026!"}').StatusCode
  } catch { [int]$_.Exception.Response.StatusCode }
}
```

## Decisiones de diseño

- **Propiedad.** Cada orden guarda `ownerId`, tomado de `user.sub` del JWT. El cliente
  nunca lo envía; si lo hace, la API responde 400.
- **404 para órdenes ajenas.** Leer, modificar o eliminar la orden de otra cuenta
  devuelve 404, igual que si no existiera, para no revelar su existencia.
- **Contraseñas.** bcrypt con costo 12 y sal automática. El registro exige al menos 15
  caracteres y como máximo 72 bytes UTF-8, sin recortar espacios. El login no vuelve a exigir el
  mínimo para no bloquear cuentas existentes.
- **JWT.** HS256 con emisor y audiencia fijos. Un JWT está firmado, no cifrado.
- **Sesión en memoria.** El token no se guarda en `localStorage`, `sessionStorage`,
  la URL ni variables `VITE_`. Las claves de consulta incluyen usuario y sesión, y
  al abrir o cerrar sesión se cancela y vacía la caché de TanStack Query.
- **Cierre de sesión local.** Cerrar sesión retira el token del navegador, pero **no
  revoca** un JWT ya emitido: seguiría siendo válido hasta vencer (15 minutos).
- **Sin roles.** No existe administrador ni cliente: todas las cuentas son iguales y
  cada una gestiona sus propias órdenes.
- **Web limitada a crear y listar.** Editar y eliminar se demuestran en la API
  (Swagger o PowerShell).

## Avisos conocidos de dependencias

- Al ejecutar `pnpm peers check` puede aparecer una discrepancia entre TypeScript 6
  y el rango `^5.0.0` que declara `tsconfck`. Se conserva TypeScript de la línea base
  y no se ocultan los avisos con overrides.
- pnpm bloquea los scripts de instalación hasta autorizarlos. Las autorizaciones
  (`@prisma/engines`, `bcrypt`, `esbuild`, `prisma`) están en `pnpm-workspace.yaml`.

## Evidencias por criterio

Reemplaza `<commit>` por el hash evaluado (`git rev-parse HEAD`).
Oculta tokens, contraseñas y secretos en capturas; no adjuntes los `.env`.

| Criterio                             | Dónde se comprueba                                                      |
| ------------------------------------ | ----------------------------------------------------------------------- |
| C1 Integración de React con la API   | `apps/web/src/api.ts`, `work-order-contract.ts`; pestaña Network        |
| C2 Listado y paginación              | `apps/web/src/App.tsx`; 25 órdenes: 20 en la primera página             |
| C3 Creación y sincronización         | `apps/web/src/App.tsx`; POST 201, consulta SQL de la orden               |
| C4 Registro y contraseñas            | `apps/api/src/auth`, `users`; `checks/auth-smoke.mjs`                   |
| C5 JWT e identidad                   | `auth-settings.ts`, `jwt.strategy.ts`; `checks/auth-settings.check.mjs`  |
| C6 Autorización por propietario      | `work-orders.service.ts`; smoke: A y B, 404 en acceso ajeno              |
| C7 Sesión y caché entre cuentas      | `apps/web/src/auth/*`; recorrido A → B → A en el navegador               |
| C8 Validación y límites              | DTOs, Swagger `/api/docs`, 429 en el intento 11                          |
| C9 Pruebas y calidad                 | Salidas de los comandos de la sección anterior, commit `<commit>`        |

## Equipo

| Integrantes       |
| ----------------- |
| Roberto Robles    |
| Francisco Chandia |
| Ruth Navarro      |
| Agustín Alvarez   |
