import path from 'path'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { db } from '../db'
import { NotFoundError, ForbiddenError, ValidationError } from '../lib/errors'
import { config } from '../config'
import { ALLOWED_MIME_TYPES } from '@wikigdd/shared'
import type { MultipartFile } from '@fastify/multipart'

export async function uploadMedia(
  gameId: string,
  ownerId: string,
  file: MultipartFile,
  pageId?: string,
  kind?: string,
) {
  const game = await db.game.findUnique({ where: { id: gameId } })
  if (!game) throw new NotFoundError('Juego no encontrado')
  if (game.ownerId !== ownerId) throw new ForbiddenError()

  const mimeType = file.mimetype
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new ValidationError(
      `Tipo de archivo no permitido. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`,
    )
  }

  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin'
  const fileId = randomUUID()
  const fileName = `${fileId}.${ext}`
  const gameUploadDir = path.join(config.UPLOAD_DIR, gameId)

  await fs.mkdir(gameUploadDir, { recursive: true })

  const filePath = path.join(gameUploadDir, fileName)
  const buffer = await file.toBuffer()

  if (buffer.length > config.MAX_UPLOAD_MB * 1024 * 1024) {
    throw new ValidationError(`El archivo excede el tamaño máximo de ${config.MAX_UPLOAD_MB} MB`)
  }

  await fs.writeFile(filePath, buffer)

  let width: number | null = null
  let height: number | null = null

  if (['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) {
    try {
      const meta = await sharp(buffer).metadata()
      width = meta.width ?? null
      height = meta.height ?? null
    } catch {
      // ignore metadata errors
    }
  }

  const resolvedKind = resolveKind(kind, mimeType)

  const media = await db.media.create({
    data: {
      gameId,
      pageId: pageId ?? null,
      url: `/wiki/media/${gameId}/${fileName}`,
      fileName: file.filename,
      mimeType,
      sizeBytes: buffer.length,
      width,
      height,
      kind: resolvedKind,
    },
  })

  return serializeMedia(media)
}

function resolveKind(kind: string | undefined, mimeType: string): 'image' | 'sprite' | 'gif' {
  if (kind === 'sprite') return 'sprite'
  if (kind === 'gif' || mimeType === 'image/gif') return 'gif'
  return 'image'
}

export async function listMedia(gameId: string, userId?: string | null, pageId?: string) {
  const game = await db.game.findUnique({ where: { id: gameId } })
  if (!game) throw new NotFoundError('Juego no encontrado')
  if (!game.isPublic && game.ownerId !== userId) throw new ForbiddenError()

  const media = await db.media.findMany({
    where: { gameId, ...(pageId ? { pageId } : {}) },
    orderBy: { createdAt: 'desc' },
  })

  return media.map(serializeMedia)
}

export async function deleteMedia(id: string, ownerId: string) {
  const media = await db.media.findUnique({
    where: { id },
    include: { game: { select: { ownerId: true } } },
  })
  if (!media) throw new NotFoundError('Archivo no encontrado')
  if (media.game.ownerId !== ownerId) throw new ForbiddenError()

  // Delete file from disk
  const filePath = path.join(config.UPLOAD_DIR, media.url.replace('/wiki/media/', ''))
  try {
    await fs.unlink(filePath)
  } catch {
    // File may not exist, continue with DB deletion
  }

  await db.media.delete({ where: { id } })
}

function serializeMedia(m: {
  id: string
  gameId: string
  pageId: string | null
  url: string
  fileName: string
  mimeType: string
  sizeBytes: number
  width: number | null
  height: number | null
  kind: 'image' | 'sprite' | 'gif'
  createdAt: Date
}) {
  return {
    ...m,
    createdAt: m.createdAt.toISOString(),
  }
}
