# Plan de proyecto — WikiGDD

> Webapp para construir wikis / GDDs (Game Design Documents) de tus juegos.
> Sirven como lineamiento de desarrollo y como repositorio único de información del juego.

---

## 1. Resumen de decisiones tomadas

| Tema | Decisión |
|------|----------|
| Estructura | Híbrida: plantilla base de GDD **modificable** + páginas libres |
| Multi-juego | Sí, cada juego con su wiki independiente |
| Entidades | Personajes, ítems, enemigos, niveles, mecánicas, etc. — cada una con página propia, imágenes, sprites e historia |
| Enlaces internos | Sí (tipo wikilink entre páginas y entidades) |
| Edición | Editor visual de bloques tipo Notion (**BlockNote**) |
| Media | Sí: concept art, mockups, diagramas, GIFs/videos de gameplay |
| Versionado | **Del juego** (snapshots/milestones del GDD), no de cada página |
| Usuarios | MVP: solo vos (admin). Diseño preparado para multi-usuario futuro |
| Visibilidad | Wikis configurables como públicas o privadas |
| Plataforma | Desktop + mobile (responsive) |
| Servidor | VPS GCP e2-standard-2 (2 vCPU, 8 GB RAM), acceso root |
| Stack | React + TypeScript, backend Node/TS, PostgreSQL |

---

## 2. Stack tecnológico propuesto

Todo en **TypeScript** de punta a punta para compartir tipos entre cliente y servidor.

### Frontend
- **React + Vite + TypeScript** — Vite por velocidad de build y DX.
- **BlockNote** — editor de bloques estilo Notion (slash commands, imágenes, drag & drop). Guarda contenido como JSON estructurado.
- **TailwindCSS** — estilos rápidos y responsive (desktop + mobile).
- **TanStack Query** — manejo de datos del servidor (cache, sincronización).
- **React Router** — navegación.

### Backend
- **Node.js + TypeScript** con **Fastify** (más liviano y rápido que Express, mejor tipado) o **NestJS** si querés algo más estructurado de entrada. Recomendación MVP: Fastify.
- **Prisma** como ORM — migraciones, tipos automáticos desde el schema, encaja perfecto con Postgres y TS.
- **Zod** — validación de datos compartida cliente/servidor.

### Base de datos
- **PostgreSQL** — la conocés, y nos da:
  - JSONB para guardar el contenido de bloques de BlockNote.
  - Full-text search nativo para buscar dentro de las wikis.
  - Relaciones limpias para entidades y enlaces.

### Infraestructura (tu VPS)
- **Docker + Docker Compose** — empaqueta app + Postgres, lo movés a cualquier lado sin dolor.
- **Caddy** como reverse proxy — HTTPS automático con Let's Encrypt (cero configuración de certificados).
- Almacenamiento de media: **filesystem del VPS** en el MVP (carpeta servida por Caddy). Migrable a GCS (Google Cloud Storage) cuando escale, ya que estás en GCP.

---

## 3. Modelo de datos (borrador)

Diseñado multi-tenant desde el inicio aunque arranques solo.

```
User
  id, email, passwordHash, displayName, createdAt

Game (un juego = una wiki)
  id, ownerId -> User
  title, slug, description, coverImage
  isPublic (bool)
  createdAt, updatedAt

Page (página de wiki; texto libre o entidad)
  id, gameId -> Game
  parentId -> Page (para jerarquía/secciones anidadas)
  type: 'doc' | 'character' | 'item' | 'enemy' | 'level' | 'mechanic' | ...
  title, slug
  content (JSONB)         <- bloques de BlockNote
  orderIndex              <- orden dentro de su sección
  createdAt, updatedAt

EntityField (campos propios según tipo de entidad)
  id, pageId -> Page
  key, value              <- ej: "HP" = "120", "Rareza" = "Épico"
  (alternativa: una columna JSONB "attributes" en Page)

Media (imágenes, sprites, gifs, videos)
  id, gameId -> Game
  pageId -> Page (opcional)
  url, type, fileName, sizeBytes, createdAt

PageLink (enlaces internos entre páginas)
  id, sourcePageId -> Page, targetPageId -> Page
  (permite "qué enlaza a esta página" / backlinks)

GameVersion (snapshot/milestone del GDD completo)
  id, gameId -> Game
  versionLabel            <- ej: "v0.3 - Vertical slice"
  notes
  snapshot (JSONB)        <- copia del estado de todas las páginas
  createdAt
```

Notas de diseño:
- **EntityField vs JSONB**: para empezar, una columna `attributes JSONB` en `Page` es más simple. Si después querés filtrar/ordenar por atributos, conviene la tabla `EntityField`. Empezamos con JSONB.
- **GameVersion** guarda un snapshot completo: así "volver a v0.2" reconstruye todo el GDD de ese momento. Es la versión del juego que pediste, no el historial editorial de cada página.
- **PageLink** se puede derivar parseando el contenido al guardar, lo que habilita backlinks ("páginas que mencionan a este enemigo").

---

## 4. Funcionalidades por etapas

### Etapa 0 — Setup (cimientos)
- Repo, TypeScript, Vite, Fastify, Prisma, Docker Compose con Postgres.
- Caddy con HTTPS en el VPS.
- Esquema inicial de DB + migraciones.
- Login básico (solo vos).

### Etapa 1 — MVP usable
- Crear/editar/borrar **juegos**.
- Crear páginas con el **editor BlockNote**.
- Plantilla base de GDD aplicada al crear un juego (secciones modificables).
- Subida de **imágenes** dentro del editor.
- Navegación por árbol de páginas (sidebar).
- Vista responsive desktop/mobile.

### Etapa 2 — Wiki en serio
- **Entidades tipadas** (personajes, ítems, enemigos, niveles, mecánicas) con campos propios.
- **Enlaces internos** entre páginas + **backlinks**.
- **Búsqueda** full-text dentro de un juego.
- Galería de **sprites/media** por entidad.
- Flag **público/privado** por juego + páginas públicas legibles sin login.

### Etapa 3 — Versionado del juego
- Crear **snapshots/milestones** del GDD (v0.1, v0.2…).
- Ver y comparar versiones; restaurar una versión anterior.

### Etapa 4 — Hacia "app" multi-usuario (futuro)
- Registro de usuarios.
- Roles y permisos (owner, editor, lector).
- Colaboración (varios editores por juego).
- Posible edición en tiempo real (BlockNote soporta colaboración con Yjs).

---

## 5. Plantilla base de GDD sugerida (modificable)

Secciones que se crean por defecto al iniciar un juego nuevo:

1. **Visión / Concepto** — pitch, género, plataforma, público objetivo.
2. **Pilares de diseño** — los 3-5 principios que guían todas las decisiones.
3. **Gameplay & Mecánicas** — core loop, mecánicas principales y secundarias.
4. **Narrativa & Mundo** — historia, lore, tono.
5. **Personajes** (sección de entidades).
6. **Enemigos** (sección de entidades).
7. **Ítems / Inventario** (sección de entidades).
8. **Niveles / Mundos** (sección de entidades).
9. **Arte & Estilo visual** — paleta, referencias, mood boards.
10. **Audio** — música, SFX, dirección sonora.
11. **UI / UX** — wireframes, flujos.
12. **Roadmap / Producción** — milestones, scope, tareas.

Todas editables, reordenables y eliminables.

---

## 6. Preguntas abiertas / decisiones pendientes

Para terminar de cerrar antes de arrancar a codear:

1. **Dominio**: ¿tenés un dominio para apuntar al VPS, o vas a usar la IP por ahora? (Caddy necesita dominio para HTTPS automático.)
2. **Escala estimada**: ¿cuántos juegos y cuántas páginas por juego imaginás? (Confirmar que vamos a escala chica/media.)
3. **Backend framework**: ¿Fastify (más simple, recomendado) o NestJS (más estructurado)?
4. **Media pesada**: los videos/GIFs de gameplay pueden pesar. ¿Los subís a la app o preferís linkear a YouTube/externo en el MVP?
5. **Diseño visual**: ¿tenés alguna referencia de cómo querés que se vea (tipo Notion, tipo wiki clásica, algo propio)?

---

## 7. Próximo paso propuesto

Una vez confirmadas las preguntas abiertas:
1. Cierro el **modelo de datos final** (schema Prisma).
2. Armo el **esqueleto del proyecto** (estructura de carpetas, Docker Compose).
3. Empezamos por la **Etapa 0** y la **Etapa 1** (MVP usable).
