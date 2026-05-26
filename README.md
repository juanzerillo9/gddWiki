# WikiGDD

Webapp para construir wikis / GDDs (Game Design Documents) de tus juegos. Sirve como lineamiento de desarrollo y repositorio único de información del juego.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS + BlockNote + TanStack Query
- **Backend:** Node.js + Fastify + TypeScript + Prisma
- **Base de datos:** PostgreSQL 16
- **Infra:** Docker + Docker Compose + Caddy (HTTPS automático)
- **Monorepo:** pnpm workspaces

## Prerrequisitos

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

## Desarrollo local

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Copiar variables de entorno

```bash
cp .env.example apps/api/.env
```

Editar `apps/api/.env` con tus valores. Para dev local:

```env
DATABASE_URL="postgresql://wikigdd:wikigdd_dev@localhost:5432/wikigdd?schema=public"
NODE_ENV="development"
PORT="3000"
JWT_SECRET="dev_secret_minimo_32_caracteres_aca"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password123"
ADMIN_DISPLAY_NAME="Admin"
UPLOAD_DIR="./uploads"
MAX_UPLOAD_MB="10"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Levantar PostgreSQL

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 4. Migraciones y seed

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Iniciar API y frontend

```bash
# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Web
pnpm dev:web
```

Abrir [http://localhost:5173](http://localhost:5173). Login con las credenciales del seed (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Estructura del monorepo

```
wikigdd/
├── packages/
│   └── shared/          # Zod schemas y tipos compartidos
├── apps/
│   ├── api/             # Backend Fastify + Prisma
│   └── web/             # Frontend React + Vite
├── infra/
│   └── deploy.md        # Guía de despliegue en VPS
├── docker-compose.yml       # Producción
├── docker-compose.dev.yml   # Desarrollo (solo DB)
└── Caddyfile
```

## Despliegue en producción

Ver [infra/deploy.md](infra/deploy.md).

## Plan de implementación

- **Etapa 0:** Cimientos (monorepo, DB, auth básica) ✅
- **Etapa 1:** MVP — CRUD juegos/páginas, editor BlockNote, imágenes
- **Etapa 2:** Wiki completa — entidades, wikilinks, búsqueda, galería
- **Etapa 3:** Versionado — snapshots/milestones del GDD
- **Etapa 4:** Multi-usuario (futuro)
