# Guía de despliegue — WikiGDD en VPS GCP

## Requisitos del servidor

- GCP e2-standard-2 (2 vCPU, 8 GB RAM) o superior
- Ubuntu 22.04 LTS
- Dominio con registro A apuntando a la IP de la VM
- Puertos 80 y 443 abiertos en el firewall de GCP

## 1. Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verificar
docker --version
docker compose version
```

## 2. Configurar firewall GCP

En la consola de GCP → VPC Network → Firewall Rules:
- Crear regla: tcp:80,443 desde 0.0.0.0/0

## 3. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/wikigdd.git
cd wikigdd
```

## 4. Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

Completar TODOS los valores, especialmente:
- `DOMAIN` — tu dominio (ej: `wiki.tudominio.com`)
- `DATABASE_URL` — usar el mismo usuario/password que POSTGRES_*
- `JWT_SECRET` — generar con: `openssl rand -base64 48`
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` — credenciales de acceso
- `POSTGRES_PASSWORD` — password segura para la DB

## 5. Build y arranque

```bash
docker compose up -d --build
```

El proceso:
1. Construye las imágenes de api y web
2. Levanta PostgreSQL y espera el healthcheck
3. La API corre `prisma migrate deploy` y `prisma db seed` al arrancar
4. Caddy obtiene el certificado HTTPS automáticamente via Let's Encrypt

## 6. Verificar el despliegue

```bash
# Ver logs
docker compose logs -f

# Verificar healthcheck
curl https://tudominio.com/api/health

# Ver estado de los contenedores
docker compose ps
```

## 7. Comandos útiles

```bash
# Detener todo
docker compose down

# Detener y borrar volúmenes (¡destructivo!)
docker compose down -v

# Ver logs de un servicio
docker compose logs -f api

# Ejecutar comando en el contenedor API
docker compose exec api sh

# Backup de la base de datos
docker compose exec db pg_dump -U wikigdd wikigdd > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker compose exec -T db psql -U wikigdd wikigdd < backup_20240101.sql
```

## 8. Actualizaciones

```bash
git pull
docker compose up -d --build
```

Las migraciones de Prisma se ejecutan automáticamente al arrancar el contenedor de la API.

## 9. Almacenamiento de media

Los archivos subidos se guardan en el volumen Docker `uploads` montado en `/data/uploads` del contenedor API y `/srv/media` de Caddy.

Para migrar a Google Cloud Storage (futuro):
- Modificar `media.service.ts` para usar `@google-cloud/storage`
- Configurar las credenciales GCP en las variables de entorno

## 10. Renovación de certificados

Caddy renueva los certificados automáticamente. No se requiere intervención manual.
