# WikiGDD — Instrucciones de deployment

## Requisitos del servidor

- Docker 24+ y Docker Compose v2
- Un dominio apuntando a la IP del servidor (registro A en tu DNS)
- Puerto 80 y 443 abiertos en el firewall

No se necesita Node.js ni nada más instalado en el servidor. Docker se encarga de todo.

---

## 1. Subir los archivos al servidor

```bash
# Opción A: clonar el repo (si lo tenés en GitHub/GitLab)
git clone https://github.com/tu-usuario/wikigdd.git
cd wikigdd

# Opción B: copiar los archivos con scp
scp -r ./gddWiki usuario@ip-del-servidor:/home/usuario/wikigdd
ssh usuario@ip-del-servidor
cd wikigdd
```

---

## 2. Crear el archivo de entorno

```bash
cp .env.example .env
nano .env   # o vim .env
```

Completar estos valores obligatoriamente:

```env
# Base de datos
DATABASE_URL="postgresql://wikigdd:TU_PASSWORD_DB@db:5432/wikigdd?schema=public"
POSTGRES_USER="wikigdd"
POSTGRES_PASSWORD="TU_PASSWORD_DB"
POSTGRES_DB="wikigdd"

# Backend
NODE_ENV="production"
PORT="3000"
JWT_SECRET="genera_uno_con: openssl rand -base64 48"
SESSION_COOKIE_NAME="session"
SESSION_TTL_DAYS="30"

# Admin inicial (se crea automáticamente al arrancar)
ADMIN_EMAIL="tu@email.com"
ADMIN_PASSWORD="password_seguro_minimo_8_chars"
ADMIN_DISPLAY_NAME="Admin"

# Media
UPLOAD_DIR="/data/uploads"
MAX_UPLOAD_MB="10"

# Dominio (sin https://, sin barra final)
DOMAIN="wiki.tudominio.com"

# Frontend
VITE_API_BASE="/wiki"

# CORS (en producción con Caddy no es necesario, pero dejarlo igual)
CORS_ORIGIN="https://wiki.tudominio.com"
```

Para generar el JWT_SECRET:
```bash
openssl rand -base64 48
```

---

## 3. Levantar todo

```bash
docker compose up -d --build
```

Este comando:
1. Construye las imágenes de la API y el frontend
2. Levanta PostgreSQL y espera a que esté listo
3. Corre las migraciones de base de datos automáticamente (`prisma migrate deploy`)
4. Crea el usuario admin (seed)
5. Levanta Fastify y el frontend compilado
6. Levanta Caddy que gestiona HTTPS automáticamente con Let's Encrypt

---

## 4. Verificar que todo funciona

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver estado de los servicios
docker compose ps

# Probar el health check
curl https://wiki.tudominio.com/wiki/health
# Respuesta esperada: {"status":"ok","timestamp":"..."}
```

Los servicios deben aparecer como `healthy` o `running`:

```
NAME        STATUS
db          healthy
api         healthy
web         running
caddy       running
```

---

## 5. Primer acceso

Abrí `https://wiki.tudominio.com` en el navegador y entrá con las credenciales de admin que configuraste en el `.env`.

---

## Comandos útiles post-deploy

```bash
# Ver logs de un servicio específico
docker compose logs api -f
docker compose logs caddy -f

# Reiniciar un servicio sin rebuildar
docker compose restart api

# Rebuildar y reiniciar todo (tras actualizar código)
docker compose up -d --build

# Acceder a la base de datos
docker compose exec db psql -U wikigdd -d wikigdd

# Ver espacio usado por los volúmenes
docker system df -v
```

---

## Actualizar el código

```bash
# Traer los cambios nuevos
git pull origin main

# Rebuildar y reiniciar (las migraciones se aplican automáticamente)
docker compose up -d --build
```

---

## Estructura de rutas en producción

```
https://wiki.tudominio.com/          → SPA (frontend React)
https://wiki.tudominio.com/wiki/*    → API Fastify
https://wiki.tudominio.com/wiki/media/* → Archivos subidos (Caddy los sirve directo)
```

Caddy gestiona HTTPS automáticamente. No hay que configurar certificados SSL manualmente.

---

## Backups

Los datos importantes están en dos lugares:

```bash
# Backup de la base de datos
docker compose exec db pg_dump -U wikigdd wikigdd > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20240101.sql | docker compose exec -T db psql -U wikigdd wikigdd
```

Los archivos subidos (imágenes, sprites) están en el volumen Docker `wikigdd_uploads`. Para hacer backup del volumen:

```bash
docker run --rm \
  -v wikigdd_uploads:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /data .
```

---

## Troubleshooting

**Caddy no obtiene el certificado SSL**
- Verificar que el dominio apunta a la IP del servidor
- Verificar que los puertos 80 y 443 están abiertos
- Ver logs: `docker compose logs caddy`

**La API no arranca**
- Verificar que el `.env` tiene todos los campos requeridos
- Ver logs: `docker compose logs api`
- El JWT_SECRET debe tener mínimo 32 caracteres

**Error de base de datos**
- Verificar que `DATABASE_URL` usa `@db:5432` (nombre del servicio Docker, no `localhost`)
- Ver logs: `docker compose logs db`

**El admin no puede entrar**
- El usuario admin se crea solo si no existe. Si cambiaste `ADMIN_EMAIL` o `ADMIN_PASSWORD` en el `.env`, hacé rebuild: `docker compose up -d --build`
