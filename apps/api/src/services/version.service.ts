import { db } from '../db'
import { NotFoundError, ForbiddenError } from '../lib/errors'
import { extractPlainText, extractLinkedPageIds } from '../lib/blocknote'
import { syncLinks } from './link.service'
import type { CreateVersionBody } from '@wikigdd/shared'

type SnapshotPage = {
  id: string
  parentId: string | null
  type: string
  title: string
  slug: string
  icon: string | null
  content: unknown
  attributes: unknown
  orderIndex: number
}

type Snapshot = {
  pages: SnapshotPage[]
}

export async function listVersions(gameId: string, userId?: string | null) {
  const game = await db.game.findUnique({ where: { id: gameId } })
  if (!game) throw new NotFoundError('Juego no encontrado')
  if (!game.isPublic && game.ownerId !== userId) throw new ForbiddenError()

  const versions = await db.gameVersion.findMany({
    where: { gameId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      gameId: true,
      versionLabel: true,
      notes: true,
      createdAt: true,
    },
  })

  return versions.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() }))
}

export async function getVersion(id: string, userId?: string | null) {
  const version = await db.gameVersion.findUnique({
    where: { id },
    include: { game: { select: { isPublic: true, ownerId: true } } },
  })
  if (!version) throw new NotFoundError('Versión no encontrada')
  if (!version.game.isPublic && version.game.ownerId !== userId) throw new ForbiddenError()

  return {
    id: version.id,
    gameId: version.gameId,
    versionLabel: version.versionLabel,
    notes: version.notes,
    snapshot: version.snapshot as Record<string, unknown>,
    createdAt: version.createdAt.toISOString(),
  }
}

export async function createVersion(
  gameId: string,
  ownerId: string,
  data: CreateVersionBody,
) {
  const game = await db.game.findUnique({ where: { id: gameId } })
  if (!game) throw new NotFoundError('Juego no encontrado')
  if (game.ownerId !== ownerId) throw new ForbiddenError()

  const snapshot = await buildSnapshot(gameId)

  const version = await db.gameVersion.create({
    data: {
      gameId,
      versionLabel: data.versionLabel,
      notes: data.notes ?? null,
      snapshot: snapshot as unknown as import('@prisma/client').Prisma.InputJsonValue,
    },
  })

  return { id: version.id, gameId: version.gameId, versionLabel: version.versionLabel, notes: version.notes, createdAt: version.createdAt.toISOString() }
}

export async function restoreVersion(id: string, ownerId: string) {
  const version = await db.gameVersion.findUnique({
    where: { id },
    include: { game: { select: { ownerId: true, title: true } } },
  })
  if (!version) throw new NotFoundError('Versión no encontrada')
  if (version.game.ownerId !== ownerId) throw new ForbiddenError()

  // Auto-backup current state
  const currentSnapshot = await buildSnapshot(version.gameId)
  await db.gameVersion.create({
    data: {
      gameId: version.gameId,
      versionLabel: `Auto-backup antes de restaurar a ${version.versionLabel}`,
      notes: 'Creado automáticamente antes de restaurar',
      snapshot: currentSnapshot as unknown as import('@prisma/client').Prisma.InputJsonValue,
    },
  })

  const snapshot = version.snapshot as Snapshot

  await db.$transaction(async (tx) => {
    // Delete all current pages (cascade deletes links)
    await tx.page.deleteMany({ where: { gameId: version.gameId } })

    // Re-create pages from snapshot
    for (const p of snapshot.pages) {
      await tx.page.create({
        data: {
          id: p.id,
          gameId: version.gameId,
          parentId: p.parentId,
          type: p.type as 'doc' | 'section' | 'character' | 'item' | 'enemy' | 'level' | 'mechanic',
          title: p.title,
          slug: p.slug,
          icon: p.icon,
          content: p.content as object,
          attributes: p.attributes as object,
          plainText: extractPlainText(p.content),
          orderIndex: p.orderIndex,
        },
      })
    }
  })

  // Re-sync links
  for (const p of snapshot.pages) {
    const linkedIds = extractLinkedPageIds(p.content)
    await syncLinks(p.id, linkedIds)
  }

  return { ok: true }
}

export async function deleteVersion(id: string, ownerId: string) {
  const version = await db.gameVersion.findUnique({
    where: { id },
    include: { game: { select: { ownerId: true } } },
  })
  if (!version) throw new NotFoundError('Versión no encontrada')
  if (version.game.ownerId !== ownerId) throw new ForbiddenError()

  await db.gameVersion.delete({ where: { id } })
}

async function buildSnapshot(gameId: string): Promise<Snapshot> {
  const pages = await db.page.findMany({
    where: { gameId },
    orderBy: { orderIndex: 'asc' },
  })

  return {
    pages: pages.map((p) => ({
      id: p.id,
      parentId: p.parentId,
      type: p.type,
      title: p.title,
      slug: p.slug,
      icon: p.icon,
      content: p.content,
      attributes: p.attributes,
      orderIndex: p.orderIndex,
    })),
  }
}
