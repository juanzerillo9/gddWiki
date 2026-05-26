# WikiGDD — Especificación técnica de desarrollo

> **Propósito de este documento:** Especificación completa e implementable de la webapp "WikiGDD". Está escrito para que un agente de IA (Claude Code, Cursor, etc.) pueda construir el proyecto end-to-end con mínima ambigüedad. Cada sección incluye contratos exactos: schema de base de datos, endpoints, tipos, configuración e instrucciones de despliegue.
>
> **Cómo usar este documento con una IA:** Pasalo completo como contexto. Pedile que implemente por etapas (Etapa 0 → 1 → 2 → 3). No saltees etapas. Después de cada etapa, verificá los criterios de aceptación antes de avanzar.

---

## 0. Glosario y convenciones

| Término | Significado |
|---------|-------------|
| **Game** | Un juego. Equivale a una wiki completa. Es el contenedor de máximo nivel. |
| **Page** | Una página de la wiki. Puede ser un documento de texto libre o una entidad tipada. |
| **Entity** | Una `Page` con `type` distinto de `doc` (character, item, enemy, level, mechanic). |
| **Section** | Una `Page` que actúa como contenedor de otras páginas (vía `parentId`). |
| **Block content** | Contenido del editor, guardado como JSON de BlockNote en columna JSONB. |
| **GameVersion** | Snapshot inmutable del estado completo de un juego en un momento (milestone). |
| **Backlink** | Lista de páginas que enlazan hacia una página dada. |
| **Owner** | Usuario dueño de un juego. En MVP, sos vos. |

**Convenciones de código:**
- TypeScript estricto (`strict: true`) en todo el monorepo.
- IDs: `cuid2` (vía Prisma `@default(cuid())`), strings, no autoincrementales.
- Fechas: siempre UTC, tipo `DateTime` en Prisma, ISO 8601 en la API.
- Naming: `camelCase` en TS/JSON, `snake_case` no se usa (Prisma mapea internamente).
- Slugs: lowercase, kebab-case, únicos dentro de su scope (game-slug único global; page-slug único por game).
- Errores de API: formato uniforme `{ error: { code, message, details? } }`.
- Todas las respuestas de API son JSON.

---

## 1. Decisiones cerradas (defaults asumidos)

> Estos defaults se asumieron para eliminar ambigüedad. Marcados con ⚙️ los que podés cambiar fácil.

| Tema | Decisión | ⚙️ |
|------|----------|----|
| Backend framework | **Fastify** | ⚙️ (alternativa: NestJS) |
| ORM | **Prisma** | |
| Base de datos | **PostgreSQL 16** | |
| Editor | **BlockNote** (React) | |
| Frontend | **React 18 + Vite + TypeScript** | |
| Estilos | **TailwindCSS + shadcn/ui** | |
| Data fetching | **TanStack Query v5** | |
| Router | **React Router v6** | |
| Validación | **Zod** (compartida cliente/servidor) | |
| Auth MVP | **Sesión por cookie httpOnly + JWT** (single admin) | |
| Media MVP | Imágenes y GIFs subidos al VPS; **videos por link externo** (YouTube/Vimeo) | ⚙️ |
| Reverse proxy | **Caddy** (HTTPS automático) | |
| Contenedores | **Docker + Docker Compose** | |
| Dominio | Variable `DOMAIN` a configurar | ⚙️ |
| Monorepo | **pnpm workspaces** | ⚙️ |

---

## 2. Arquitectura general

```
┌─────────────────────────────────────────────────────────┐
│                      VPS (GCP e2-standard-2)             │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Caddy   │───▶│   Frontend   │    │   Backend     │  │
│  │ (HTTPS)  │    │ (static SPA) │    │  (Fastify)    │  │
│  │  :443    │    │   nginx      │    │   :3000       │  │
│  └────┬─────┘    └──────────────┘    └───────┬───────┘  │
│       │                                      │          │
│       │ /api/* ──────────────────────────────┘          │
│       │                                      │          │
│       │                              ┌───────▼───────┐  │
│       │                              │  PostgreSQL   │  │
│       │                              │    :5432      │  │
│       │                              └───────────────┘  │
│       │                                                  │
│       └── /media/* ──▶ volumen filesystem (uploads/)     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Flujo de requests:**
- `https://DOMAIN/` → SPA estática (React build).
- `https://DOMAIN/api/*` → Fastify backend.
- `https://DOMAIN/media/*` → archivos subidos (servidos por Caddy desde volumen).

**Separación de responsabilidades:**
- Frontend: render, edición (BlockNote), routing client-side, cache (TanStack Query).
- Backend: auth, CRUD, validación, parseo de enlaces internos, búsqueda, snapshots.
- DB: persistencia, full-text search, integridad referencial.

---

## 3. Estructura del monorepo

```
wikigdd/
├── package.json                 # workspace root, scripts globales
├── pnpm-workspace.yaml
├── tsconfig.base.json           # config TS compartida
├── docker-compose.yml           # producción
├── docker-compose.dev.yml       # desarrollo local
├── Caddyfile
├── .env.example
├── README.md
│
├── packages/
│   └── shared/                  # tipos y schemas Zod compartidos
│       ├── package.json
│       ├── src/
│       │   ├── index.ts
│       │   ├── schemas/         # Zod schemas (game, page, media, etc.)
│       │   │   ├── game.ts
│       │   │   ├── page.ts
│       │   │   ├── media.ts
│       │   │   ├── version.ts
│       │   │   └── auth.ts
│       │   ├── types/           # tipos derivados de los schemas
│       │   │   └── index.ts
│       │   └── constants/
│       │       ├── entity-types.ts
│       │       └── default-template.ts
│       └── tsconfig.json
│
├── apps/
│   ├── api/                     # backend Fastify
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── server.ts        # bootstrap Fastify
│   │   │   ├── app.ts           # registro de plugins y rutas
│   │   │   ├── config.ts        # carga y valida env vars con Zod
│   │   │   ├── db.ts            # Prisma client singleton
│   │   │   ├── plugins/
│   │   │   │   ├── auth.ts      # JWT, decorador request.user
│   │   │   │   ├── cors.ts
│   │   │   │   └── multipart.ts # subida de archivos
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── games.routes.ts
│   │   │   │   ├── pages.routes.ts
│   │   │   │   ├── media.routes.ts
│   │   │   │   ├── versions.routes.ts
│   │   │   │   └── search.routes.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── game.service.ts
│   │   │   │   ├── page.service.ts
│   │   │   │   ├── link.service.ts     # parseo de enlaces internos
│   │   │   │   ├── media.service.ts
│   │   │   │   ├── version.service.ts
│   │   │   │   └── search.service.ts
│   │   │   ├── lib/
│   │   │   │   ├── errors.ts    # clases de error + handler
│   │   │   │   ├── slug.ts
│   │   │   │   └── blocknote.ts # utilidades para parsear contenido
│   │   │   └── types/
│   │   │       └── fastify.d.ts # augmentación de tipos
│   │   └── tsconfig.json
│   │
│   └── web/                     # frontend React
│       ├── package.json
│       ├── Dockerfile
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── router.tsx
│       │   ├── api/             # cliente API (fetch wrappers + hooks)
│       │   │   ├── client.ts
│       │   │   ├── games.ts
│       │   │   ├── pages.ts
│       │   │   ├── media.ts
│       │   │   ├── versions.ts
│       │   │   └── auth.ts
│       │   ├── components/
│       │   │   ├── ui/          # shadcn/ui
│       │   │   ├── editor/      # wrapper de BlockNote
│       │   │   │   ├── Editor.tsx
│       │   │   │   ├── WikiLinkExtension.tsx
│       │   │   │   └── ImageUpload.tsx
│       │   │   ├── layout/
│       │   │   │   ├── AppShell.tsx
│       │   │   │   ├── Sidebar.tsx      # árbol de páginas
│       │   │   │   └── TopBar.tsx
│       │   │   ├── pages/
│       │   │   │   ├── PageTree.tsx
│       │   │   │   ├── PageView.tsx
│       │   │   │   ├── EntityFields.tsx
│       │   │   │   ├── Backlinks.tsx
│       │   │   │   └── MediaGallery.tsx
│       │   │   └── games/
│       │   │       ├── GameCard.tsx
│       │   │       └── GameList.tsx
│       │   ├── routes/          # páginas/vistas
│       │   │   ├── LoginRoute.tsx
│       │   │   ├── GamesRoute.tsx
│       │   │   ├── GameRoute.tsx
│       │   │   ├── PageRoute.tsx
│       │   │   ├── SearchRoute.tsx
│       │   │   └── VersionsRoute.tsx
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── styles/
│       └── tsconfig.json
│
└── infra/
    └── deploy.md                # instrucciones de despliegue
```

---

## 4. Schema de base de datos (Prisma)

> Archivo: `apps/api/prisma/schema.prisma`. Este es el contrato canónico de datos.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────────
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  displayName  String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  games        Game[]
}

// ─────────────────────────────────────────────
// JUEGOS (= wikis)
// ─────────────────────────────────────────────
model Game {
  id          String   @id @default(cuid())
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  title       String
  slug        String   @unique
  description String?
  coverImage  String?  // URL relativa en /media
  isPublic    Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  pages       Page[]
  media       Media[]
  versions    GameVersion[]

  @@index([ownerId])
}

// ─────────────────────────────────────────────
// PÁGINAS (docs + entidades + secciones)
// ─────────────────────────────────────────────
enum PageType {
  doc        // documento de texto libre
  section    // contenedor de otras páginas
  character
  item
  enemy
  level
  mechanic
}

model Page {
  id          String    @id @default(cuid())
  gameId      String
  game        Game      @relation(fields: [gameId], references: [id], onDelete: Cascade)

  parentId    String?
  parent      Page?     @relation("PageHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Page[]    @relation("PageHierarchy")

  type        PageType  @default(doc)
  title       String
  slug        String
  icon        String?   // emoji o nombre de ícono opcional

  content     Json      @default("{}")   // BlockNote JSON (bloques)
  attributes  Json      @default("{}")   // campos propios de entidad (key/value)
  plainText   String    @default("")     // texto extraído para full-text search

  orderIndex  Int       @default(0)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  media       Media[]
  outgoingLinks PageLink[] @relation("LinkSource")
  incomingLinks PageLink[] @relation("LinkTarget")

  @@unique([gameId, slug])
  @@index([gameId])
  @@index([parentId])
  @@index([gameId, type])
}

// ─────────────────────────────────────────────
// ENLACES INTERNOS ENTRE PÁGINAS
// ─────────────────────────────────────────────
model PageLink {
  id            String  @id @default(cuid())
  sourcePageId  String
  source        Page    @relation("LinkSource", fields: [sourcePageId], references: [id], onDelete: Cascade)
  targetPageId  String
  target        Page    @relation("LinkTarget", fields: [targetPageId], references: [id], onDelete: Cascade)

  createdAt     DateTime @default(now())

  @@unique([sourcePageId, targetPageId])
  @@index([targetPageId])
}

// ─────────────────────────────────────────────
// MEDIA (imágenes, sprites, gifs)
// ─────────────────────────────────────────────
model Media {
  id         String   @id @default(cuid())
  gameId     String
  game       Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  pageId     String?
  page       Page?    @relation(fields: [pageId], references: [id], onDelete: SetNull)

  url        String   // ruta relativa en /media
  fileName   String
  mimeType   String
  sizeBytes  Int
  width      Int?
  height     Int?
  kind       MediaKind @default(image)

  createdAt  DateTime @default(now())

  @@index([gameId])
  @@index([pageId])
}

enum MediaKind {
  image
  sprite
  gif
}

// ─────────────────────────────────────────────
// VERSIONES DEL JUEGO (snapshots/milestones)
// ─────────────────────────────────────────────
model GameVersion {
  id           String   @id @default(cuid())
  gameId       String
  game         Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  versionLabel String   // ej: "v0.3 - Vertical slice"
  notes        String?
  snapshot     Json     // copia completa: pages + attributes + media refs

  createdAt    DateTime @default(now())

  @@index([gameId])
}
```

**Full-text search:** se usa la columna `Page.plainText`. En una migración manual posterior se agrega un índice GIN:

```sql
-- migración SQL adicional (apps/api/prisma/migrations/.../search.sql)
ALTER TABLE "Page" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', coalesce("plainText", '') || ' ' || coalesce("title", ''))) STORED;
CREATE INDEX page_search_idx ON "Page" USING GIN ("searchVector");
```

---

## 5. API REST — contrato completo

**Base URL:** `/api`
**Auth:** cookie `session` (JWT httpOnly) salvo endpoints marcados como público.
**Content-Type:** `application/json` (salvo subida de archivos: `multipart/form-data`).

### 5.1 Formato de errores

Todas las respuestas de error siguen este formato y usan el status HTTP apropiado:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "El juego no existe",
    "details": null
  }
}
```

Códigos de error estándar: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL` (500).

### 5.2 Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | público | Login. Body: `{ email, password }`. Setea cookie `session`. Devuelve `{ user }`. |
| POST | `/api/auth/logout` | sí | Borra la cookie de sesión. |
| GET | `/api/auth/me` | sí | Devuelve `{ user }` actual. 401 si no hay sesión. |

> **MVP:** no hay endpoint de registro público. El usuario admin se crea con `prisma/seed.ts` usando `ADMIN_EMAIL` y `ADMIN_PASSWORD` del `.env`. La Etapa 4 agregará `/api/auth/register`.

**Response `user`:**
```ts
{ id: string; email: string; displayName: string }
```

### 5.3 Juegos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/games` | sí | Lista los juegos del usuario. |
| GET | `/api/games/:slug` | público si `isPublic` | Detalle de un juego por slug. |
| POST | `/api/games` | sí | Crea un juego. Aplica plantilla base. |
| PATCH | `/api/games/:id` | sí (owner) | Actualiza título, descripción, isPublic, coverImage. |
| DELETE | `/api/games/:id` | sí (owner) | Borra el juego y todo su contenido (cascade). |

**POST /api/games — body:**
```ts
{
  title: string;            // requerido, 1-120 chars
  description?: string;     // opcional, max 500
  applyTemplate?: boolean;  // default true: crea secciones base del GDD
}
```
**Respuesta 201:** objeto `Game` completo. El `slug` se genera del título; si colisiona, se sufija `-2`, `-3`, etc.

**Comportamiento de `applyTemplate`:** si es `true`, al crear el juego se generan automáticamente las páginas/secciones definidas en `constants/default-template.ts` (ver sección 7).

### 5.4 Páginas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/games/:gameId/pages` | público si game.isPublic | Árbol de páginas (jerárquico) del juego. |
| GET | `/api/pages/:id` | público si game.isPublic | Detalle de una página, con backlinks y media. |
| POST | `/api/games/:gameId/pages` | sí (owner) | Crea una página/entidad. |
| PATCH | `/api/pages/:id` | sí (owner) | Actualiza contenido/título/atributos/orden/parent. |
| DELETE | `/api/pages/:id` | sí (owner) | Borra página (y descendientes por cascade). |
| POST | `/api/games/:gameId/pages/reorder` | sí (owner) | Reordena/reparenta en batch. |

**POST /api/games/:gameId/pages — body:**
```ts
{
  type: "doc" | "section" | "character" | "item" | "enemy" | "level" | "mechanic";
  title: string;            // requerido
  parentId?: string | null; // null = raíz
  icon?: string;
  content?: BlockNoteJSON;   // default documento vacío
  attributes?: Record<string, string>; // campos de entidad
}
```

**PATCH /api/pages/:id — body (todos opcionales):**
```ts
{
  title?: string;
  icon?: string;
  content?: BlockNoteJSON;
  attributes?: Record<string, string>;
  parentId?: string | null;
  orderIndex?: number;
}
```

**Efectos secundarios obligatorios al guardar `content` (PATCH/POST):**
1. Extraer `plainText` del contenido BlockNote (concatenar el texto de todos los bloques) y guardarlo en `Page.plainText`.
2. Parsear los enlaces internos del contenido (ver sección 6) y **reconstruir** las filas de `PageLink` con `sourcePageId = esta página`: borrar las viejas, insertar las nuevas.

**GET /api/pages/:id — respuesta:**
```ts
{
  page: {
    id, gameId, parentId, type, title, slug, icon,
    content, attributes, orderIndex, createdAt, updatedAt
  };
  backlinks: Array<{ id: string; title: string; slug: string; type: PageType }>;
  media: Array<MediaDTO>;
}
```

**POST /reorder — body:**
```ts
{
  items: Array<{ id: string; parentId: string | null; orderIndex: number }>;
}
```
Aplica todos los cambios en una transacción.

**Árbol de páginas — GET /api/games/:gameId/pages — respuesta:**
```ts
type PageTreeNode = {
  id: string; title: string; slug: string;
  type: PageType; icon: string | null; orderIndex: number;
  children: PageTreeNode[];
};
// respuesta: { tree: PageTreeNode[] }
```

### 5.5 Media

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/games/:gameId/media` | sí (owner) | Sube un archivo. `multipart/form-data` campo `file`, opcional `pageId`, `kind`. |
| GET | `/api/games/:gameId/media` | público si game.isPublic | Lista media del juego. Filtro opcional `?pageId=`. |
| DELETE | `/api/media/:id` | sí (owner) | Borra registro y archivo físico. |

**Validaciones de subida:**
- Tipos permitidos: `image/png`, `image/jpeg`, `image/webp`, `image/gif`.
- Tamaño máximo: `MAX_UPLOAD_MB` (default 10 MB).
- Se guarda en `UPLOAD_DIR/{gameId}/{cuid}.{ext}`.
- `url` resultante: `/media/{gameId}/{cuid}.{ext}`.
- Para imágenes, extraer `width`/`height` con `sharp`.

**MediaDTO:**
```ts
{
  id: string; gameId: string; pageId: string | null;
  url: string; fileName: string; mimeType: string;
  sizeBytes: number; width: number | null; height: number | null;
  kind: "image" | "sprite" | "gif"; createdAt: string;
}
```

### 5.6 Versiones del juego

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/games/:gameId/versions` | público si game.isPublic | Lista versiones (sin el snapshot pesado). |
| GET | `/api/versions/:id` | público si game.isPublic | Detalle de una versión, con snapshot completo. |
| POST | `/api/games/:gameId/versions` | sí (owner) | Crea snapshot del estado actual. |
| POST | `/api/versions/:id/restore` | sí (owner) | Restaura el juego a ese snapshot. |
| DELETE | `/api/versions/:id` | sí (owner) | Borra una versión. |

**POST /api/games/:gameId/versions — body:**
```ts
{ versionLabel: string; notes?: string }
```
**Comportamiento:** construye un `snapshot` JSON con todas las páginas del juego (id, type, title, slug, parentId, content, attributes, orderIndex) y las referencias de media. Lo guarda inmutable.

**POST /api/versions/:id/restore — comportamiento:**
- Reemplaza el estado actual de páginas del juego por el del snapshot (transacción).
- **Antes de restaurar**, crea automáticamente una versión de respaldo del estado actual con label `"Auto-backup antes de restaurar a {versionLabel}"`.
- Reconstruye `PageLink` y `plainText` tras restaurar.

### 5.7 Búsqueda

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/games/:gameId/search?q=` | público si game.isPublic | Full-text search en páginas del juego. |

**Respuesta:**
```ts
{
  results: Array<{
    pageId: string; title: string; slug: string;
    type: PageType; snippet: string; rank: number;
  }>;
}
```
Implementación: query SQL usando `searchVector @@ websearch_to_tsquery('spanish', $q)` con `ts_rank` y `ts_headline` para el snippet.


---

## 6. Enlaces internos (wikilinks) — especificación

El editor permite enlazar a otras páginas del mismo juego. Mecánica:

1. **Trigger en el editor:** al escribir `@`, BlockNote muestra un menú con las páginas del juego (autocompletar por título). Al elegir una, se inserta un *inline content* custom de tipo `pageLink` con `{ pageId, label }`.
2. **Persistencia:** el `pageId` queda embebido en el JSON de BlockNote. El `label` es el texto visible (título de la página al momento de enlazar; se puede re-resolver al render).
3. **Parseo en el backend (`link.service.ts`):** al guardar `content`, recorrer recursivamente el JSON buscando inline content de tipo `pageLink`, extraer todos los `pageId` distintos, y reconstruir `PageLink`:
   ```
   DELETE FROM PageLink WHERE sourcePageId = :pageId;
   INSERT INTO PageLink (sourcePageId, targetPageId) VALUES ... (deduplicado, ignorando self-links);
   ```
4. **Backlinks:** `GET /api/pages/:id` devuelve `incomingLinks` resueltos a `{ id, title, slug, type }`.
5. **Render:** en el frontend, el inline `pageLink` se renderiza como un link a `/games/:gameSlug/pages/:targetSlug`. Si el target fue borrado, se muestra en estado "roto" (texto tachado + tooltip).

**Función de extracción de texto plano (`lib/blocknote.ts`):**
```ts
// Recorre el árbol de bloques de BlockNote y concatena todo el texto.
// Incluye el label de los pageLink. Devuelve string para plainText/search.
export function extractPlainText(content: BlockNoteJSON): string { ... }

// Recorre el contenido y devuelve los pageId enlazados (únicos).
export function extractLinkedPageIds(content: BlockNoteJSON): string[] { ... }
```

---

## 7. Plantilla base de GDD (modificable)

> Archivo: `packages/shared/src/constants/default-template.ts`

Al crear un juego con `applyTemplate: true`, se generan estas páginas en orden. Las de tipo `section` son contenedores; sus hijos se crean vacíos y editables. Todo es editable, reordenable y eliminable después.

```ts
export const DEFAULT_TEMPLATE: TemplateNode[] = [
  { type: "doc",     title: "Visión / Concepto",      icon: "🎯" },
  { type: "doc",     title: "Pilares de diseño",      icon: "🏛️" },
  { type: "doc",     title: "Gameplay & Mecánicas",   icon: "🎮" },
  { type: "doc",     title: "Narrativa & Mundo",      icon: "📖" },
  { type: "section", title: "Personajes",             icon: "🧑", childType: "character" },
  { type: "section", title: "Enemigos",               icon: "👾", childType: "enemy" },
  { type: "section", title: "Ítems",                  icon: "🎒", childType: "item" },
  { type: "section", title: "Niveles / Mundos",       icon: "🗺️", childType: "level" },
  { type: "section", title: "Mecánicas",              icon: "⚙️", childType: "mechanic" },
  { type: "doc",     title: "Arte & Estilo visual",   icon: "🎨" },
  { type: "doc",     title: "Audio",                  icon: "🔊" },
  { type: "doc",     title: "UI / UX",                icon: "📱" },
  { type: "doc",     title: "Roadmap / Producción",   icon: "📋" },
];

type TemplateNode = {
  type: PageType;
  title: string;
  icon?: string;
  childType?: PageType; // tipo por defecto al crear hijos en una sección
};
```

**Campos por tipo de entidad** (sugeridos como `attributes` iniciales; el usuario puede agregar/quitar):

```ts
export const ENTITY_DEFAULT_FIELDS: Record<PageType, string[]> = {
  character: ["Rol", "Facción", "Edad", "Habilidades"],
  enemy:     ["HP", "Daño", "Comportamiento", "Debilidad"],
  item:      ["Tipo", "Rareza", "Efecto", "Valor"],
  level:     ["Bioma", "Dificultad", "Objetivo", "Duración estimada"],
  mechanic:  ["Categoría", "Inputs", "Estado", "Dependencias"],
  doc:       [],
  section:   [],
};
```

---

## 8. Frontend — especificación de pantallas

### 8.1 Rutas (React Router)

| Ruta | Componente | Auth | Descripción |
|------|-----------|------|-------------|
| `/login` | LoginRoute | público | Form de login. |
| `/` | GamesRoute | sí | Grilla de juegos del usuario + botón "Nuevo juego". |
| `/games/:gameSlug` | GameRoute | público si isPublic | Layout con sidebar (árbol) + landing del juego. |
| `/games/:gameSlug/pages/:pageSlug` | PageRoute | público si isPublic | Vista/edición de una página. |
| `/games/:gameSlug/search` | SearchRoute | público si isPublic | Resultados de búsqueda. |
| `/games/:gameSlug/versions` | VersionsRoute | público si isPublic | Lista y gestión de versiones. |

### 8.2 Componentes clave

**AppShell / Sidebar:** layout responsive. En desktop, sidebar fija con el árbol de páginas (drag & drop para reordenar/reparentar → llama a `/reorder`). En mobile, sidebar colapsable (drawer). Botón "+" por sección para crear páginas/entidades.

**Editor (BlockNote):**
- Wrapper sobre `@blocknote/react`.
- Slash menu (`/`) estándar + comando custom para insertar imagen (sube vía `/api/games/:gameId/media` y referencia la URL).
- Mención `@` para wikilinks (sección 6).
- Autosave: debounce 800ms → `PATCH /api/pages/:id`. Indicador de "Guardando…/Guardado".
- Modo lectura (sin edición) cuando el visitante no es owner / juego público.

**EntityFields:** panel lateral o superior en páginas de tipo entidad. Renderiza `attributes` como pares key/value editables (inputs). El owner puede agregar/eliminar campos. Inicializa con `ENTITY_DEFAULT_FIELDS`.

**MediaGallery:** grilla de imágenes/sprites de la página o del juego. Subida por drag & drop. Click → insertar en el editor o ver en grande.

**Backlinks:** al pie de la página, lista de páginas que enlazan a esta (de `GET /api/pages/:id`).

**VersionsRoute:** lista de versiones con label, fecha, notas. Acciones: crear versión (modal con label + notas), ver snapshot (read-only), restaurar (con confirmación), borrar.

### 8.3 Estado y data fetching

- **TanStack Query** para todo lo del servidor. Query keys: `['games']`, `['game', slug]`, `['pageTree', gameId]`, `['page', id]`, `['versions', gameId]`, etc.
- Mutaciones con invalidación optimista donde aplique (ej: autosave del editor).
- Cliente API central (`api/client.ts`): wrapper de `fetch` con `credentials: 'include'`, manejo de errores uniforme, base `/api`.

### 8.4 Responsive / mobile

- Tailwind breakpoints. Sidebar → drawer en `<md`.
- Editor BlockNote funciona en touch; verificar toolbar en mobile.
- Vista de lectura optimizada para celular (tipografía legible, imágenes responsive).

---

## 9. Configuración (variables de entorno)

> Archivo: `.env.example`. El backend valida estas vars con Zod en `config.ts` al arrancar (falla rápido si falta alguna).

```bash
# ── Base de datos ──
DATABASE_URL="postgresql://wikigdd:CHANGEME@db:5432/wikigdd?schema=public"
POSTGRES_USER="wikigdd"
POSTGRES_PASSWORD="CHANGEME"
POSTGRES_DB="wikigdd"

# ── Backend ──
NODE_ENV="production"
PORT="3000"
JWT_SECRET="CHANGEME_genera_uno_largo_aleatorio"
SESSION_COOKIE_NAME="session"
SESSION_TTL_DAYS="30"

# ── Admin inicial (seed) ──
ADMIN_EMAIL="vos@ejemplo.com"
ADMIN_PASSWORD="CHANGEME"
ADMIN_DISPLAY_NAME="Admin"

# ── Media ──
UPLOAD_DIR="/data/uploads"
MAX_UPLOAD_MB="10"

# ── Frontend / dominio ──
DOMAIN="wiki.tudominio.com"      # ⚙️ cambiar; o usar IP en dev
VITE_API_BASE="/api"

# ── CORS (dev) ──
CORS_ORIGIN="http://localhost:5173"
```

---

## 10. Docker y despliegue

### 10.1 docker-compose.yml (producción)

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NODE_ENV: production
      PORT: 3000
      JWT_SECRET: ${JWT_SECRET}
      UPLOAD_DIR: /data/uploads
      MAX_UPLOAD_MB: ${MAX_UPLOAD_MB}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      ADMIN_DISPLAY_NAME: ${ADMIN_DISPLAY_NAME}
    volumes:
      - uploads:/data/uploads
    # entrypoint corre: prisma migrate deploy && prisma db seed && node dist/server.js

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: unless-stopped
    # sirve el build estático con nginx interno o se copia al volumen de caddy

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - uploads:/srv/media:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - api
      - web

volumes:
  pgdata:
  uploads:
  caddy_data:
  caddy_config:
```

### 10.2 Caddyfile

```
{$DOMAIN} {
    encode gzip

    # API → backend
    handle /api/* {
        reverse_proxy api:3000
    }

    # Media estática
    handle /media/* {
        root * /srv
        file_server
    }

    # SPA → frontend (fallback a index.html)
    handle {
        reverse_proxy web:80
    }
}
```

### 10.3 Dockerfiles

**apps/api/Dockerfile** (multi-stage): build con pnpm → genera Prisma client → compila TS → imagen runtime slim con solo `dist/`, `node_modules` de prod y `prisma/`. Entrypoint: `prisma migrate deploy && prisma db seed && node dist/server.js`.

**apps/web/Dockerfile** (multi-stage): build con pnpm (`vite build`) → copia `dist/` a imagen `nginx:alpine` con config SPA (fallback a `index.html`).

### 10.4 Pasos de despliegue en el VPS (resumen)

```bash
# 1. Instalar Docker + Docker Compose en la VM GCP
# 2. Apuntar el DNS del dominio (registro A) a la IP de la VM
# 3. Abrir puertos 80 y 443 en el firewall de GCP
# 4. Clonar el repo, copiar .env.example → .env y completar secretos
# 5. docker compose up -d --build
# 6. Caddy obtiene el certificado HTTPS automáticamente
# 7. Verificar https://DOMAIN  (login con ADMIN_EMAIL/ADMIN_PASSWORD)
```

> Detalle ampliado en `infra/deploy.md`.

---

## 11. Plan de implementación por etapas (con criterios de aceptación)

> La IA debe implementar en este orden y validar cada etapa antes de seguir.

### Etapa 0 — Cimientos
**Tareas:** monorepo pnpm; `packages/shared` con Zod schemas y tipos; Prisma schema + primera migración; Fastify boot con `config.ts` (validación de env); Docker Compose dev con Postgres; seed del admin; healthcheck `/api/health`.
**Aceptación:**
- `docker compose -f docker-compose.dev.yml up` levanta DB + api.
- `GET /api/health` devuelve 200.
- `prisma db seed` crea el usuario admin.
- `POST /api/auth/login` con credenciales admin setea cookie y `GET /api/auth/me` devuelve el user.

### Etapa 1 — MVP usable
**Tareas:** CRUD de juegos con plantilla base; CRUD de páginas; editor BlockNote con autosave; subida de imágenes; árbol de páginas en sidebar; layout responsive; login en frontend.
**Aceptación:**
- Crear un juego genera las páginas de la plantilla.
- Editar una página persiste el contenido (recarga lo conserva).
- Subir una imagen la inserta en el editor y queda servida en `/media`.
- Navegación por el árbol funciona en desktop y mobile.

### Etapa 2 — Wiki completa
**Tareas:** entidades tipadas con `attributes`; wikilinks `@` + backlinks; búsqueda full-text (índice GIN); galería de media por entidad; flag público/privado + lectura sin login de juegos públicos.
**Aceptación:**
- Crear un personaje con campos propios y editarlos.
- Enlazar dos páginas con `@`; la página destino muestra el backlink.
- Buscar texto devuelve resultados con snippet.
- Un juego marcado público es legible en incógnito; uno privado da 404/403.

### Etapa 3 — Versionado del juego
**Tareas:** crear snapshot; listar versiones; ver snapshot read-only; restaurar (con auto-backup previo); borrar versión.
**Aceptación:**
- Crear "v0.1" guarda el estado actual.
- Modificar páginas y restaurar "v0.1" vuelve al estado guardado.
- La restauración genera un auto-backup automático.

### Etapa 4 — Multi-usuario (futuro, no MVP)
**Tareas:** registro; roles (owner/editor/lector); compartir juegos; colaboración en tiempo real (BlockNote + Yjs); migración de media a GCS.
**Aceptación:** (se define al llegar a esta etapa).

---

## 12. Checklist de calidad transversal

- [ ] TypeScript estricto sin `any` implícitos.
- [ ] Toda entrada de API validada con Zod antes de tocar la DB.
- [ ] Autorización: el owner sólo accede/modifica sus juegos; público sólo lee `isPublic`.
- [ ] Errores con formato uniforme y status correcto.
- [ ] Operaciones multi-fila (reorder, restore, links) en transacción.
- [ ] Migraciones Prisma versionadas en el repo.
- [ ] Subida de archivos: validar tipo y tamaño antes de escribir a disco.
- [ ] Secrets nunca commiteados; sólo `.env.example`.
- [ ] README con instrucciones de dev y deploy.
- [ ] Mobile verificado en las vistas principales.

---

## 13. Notas finales para la IA implementadora

- **No inventar endpoints** fuera de los listados sin justificarlo.
- **Respetar los contratos** de la sección 5 al pie de la letra (nombres de campos, status codes).
- **Compartir tipos** desde `packages/shared`; no duplicar definiciones en api/web.
- **Preguntar** sólo si un contrato es genuinamente ambiguo; en caso contrario, seguir los defaults de la sección 1.
- Entregar **commits por etapa** con mensajes claros.
- Incluir un **seed mínimo de ejemplo** (un juego demo con 2-3 páginas) opcional vía flag, útil para probar el frontend.

