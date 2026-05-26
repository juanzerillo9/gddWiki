import { db } from '../db'
import { NotFoundError, ForbiddenError } from '../lib/errors'
import { uniqueSlug } from '../lib/slug'
import { extractPlainText, extractLinkedPageIds } from '../lib/blocknote'
import { syncLinks } from './link.service'
import type { CreatePageBody, UpdatePageBody, ReorderBody, PageTreeNode } from '@wikigdd/shared'

type PageRow = {
  id: string
  gameId: string
  parentId: string | null
  type: string
  title: string
  slug: string
  icon: string | null
  content: unknown
  attributes: unknown
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

function serializePage(p: PageRow) {
  return {
    id: p.id,
    gameId: p.gameId,
    parentId: p.parentId,
    type: p.type as PageTreeNode['type'],
    title: p.title,
    slug: p.slug,
    icon: p.icon,
    content: (p.content as Record<string, unknown>) ?? {},
    attributes: (p.attributes as Record<string, string>) ?? {},
    orderIndex: p.orderIndex,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

export async function getPageTree(gameId: string): Promise<{ tree: PageTreeNode[] }> {
  const pages = await db.page.findMany({
    where: { gameId },
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      parentId: true,
      title: true,
      slug: true,
      type: true,
      icon: true,
      orderIndex: true,
    },
  })

  const map = new Map<string, PageTreeNode>()
  const roots: PageTreeNode[] = []

  for (const p of pages) {
    map.set(p.id, {
      id: p.id,
      title: p.title,
      slug: p.slug,
      type: p.type as PageTreeNode['type'],
      icon: p.icon,
      orderIndex: p.orderIndex,
      children: [],
    })
  }

  for (const p of pages) {
    const node = map.get(p.id)!
    if (p.parentId) {
      const parent = map.get(p.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  return { tree: roots }
}

export async function getPageBySlug(
  gameSlug: string,
  pageSlug: string,
  userId?: string | null,
) {
  const game = await db.game.findUnique({ where: { slug: gameSlug } })
  if (!game) throw new NotFoundError('Juego no encontrado')
  if (!game.isPublic && game.ownerId !== userId) throw new ForbiddenError()

  const page = await db.page.findUnique({
    where: { gameId_slug: { gameId: game.id, slug: pageSlug } },
    include: {
      incomingLinks: {
        include: {
          source: { select: { id: true, title: true, slug: true, type: true } },
        },
      },
      media: true,
    },
  })
  if (!page) throw new NotFoundError('Página no encontrada')

  const backlinks = page.incomingLinks.map((l) => ({
    id: l.source.id,
    title: l.source.title,
    slug: l.source.slug,
    type: l.source.type as PageTreeNode['type'],
  }))
  const media = page.media.map((m) => ({
    id: m.id,
    gameId: m.gameId,
    pageId: m.pageId,
    url: m.url,
    fileName: m.fileName,
    mimeType: m.mimeType,
    sizeBytes: m.sizeBytes,
    width: m.width,
    height: m.height,
    kind: m.kind as 'image' | 'sprite' | 'gif',
    createdAt: m.createdAt.toISOString(),
  }))

  return { page: serializePage(page), backlinks, media }
}

export async function getPageDetail(id: string, userId?: string | null) {
  const page = await db.page.findUnique({
    where: { id },
    include: {
      game: { select: { isPublic: true, ownerId: true } },
      incomingLinks: {
        include: {
          source: {
            select: { id: true, title: true, slug: true, type: true },
          },
        },
      },
      media: true,
    },
  })

  if (!page) throw new NotFoundError('Página no encontrada')
  if (!page.game.isPublic && page.game.ownerId !== userId) throw new ForbiddenError()

  const backlinks = page.incomingLinks.map((l) => ({
    id: l.source.id,
    title: l.source.title,
    slug: l.source.slug,
    type: l.source.type as PageTreeNode['type'],
  }))

  const media = page.media.map((m) => ({
    id: m.id,
    gameId: m.gameId,
    pageId: m.pageId,
    url: m.url,
    fileName: m.fileName,
    mimeType: m.mimeType,
    sizeBytes: m.sizeBytes,
    width: m.width,
    height: m.height,
    kind: m.kind as 'image' | 'sprite' | 'gif',
    createdAt: m.createdAt.toISOString(),
  }))

  return {
    page: serializePage(page),
    backlinks,
    media,
  }
}

export async function createPage(gameId: string, ownerId: string, data: CreatePageBody) {
  const game = await db.game.findUnique({ where: { id: gameId } })
  if (!game) throw new NotFoundError('Juego no encontrado')
  if (game.ownerId !== ownerId) throw new ForbiddenError()

  const slug = await uniqueSlug(data.title, async (s) => {
    const exists = await db.page.findUnique({ where: { gameId_slug: { gameId, slug: s } } })
    return exists !== null
  })

  const content = data.content ?? {}
  const plainText = extractPlainText(content)

  const page = await db.page.create({
    data: {
      gameId,
      type: data.type,
      title: data.title,
      slug,
      parentId: data.parentId ?? null,
      icon: data.icon ?? null,
      content: content as unknown as import('@prisma/client').Prisma.InputJsonValue,
      attributes: (data.attributes ?? {}) as unknown as import('@prisma/client').Prisma.InputJsonValue,
      plainText,
      orderIndex: await nextOrderIndex(gameId, data.parentId ?? null),
    },
  })

  const linkedIds = extractLinkedPageIds(content)
  await syncLinks(page.id, linkedIds)

  return serializePage(page)
}

async function nextOrderIndex(gameId: string, parentId: string | null): Promise<number> {
  const last = await db.page.findFirst({
    where: { gameId, parentId },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  })
  return (last?.orderIndex ?? -1) + 1
}

export async function updatePage(id: string, ownerId: string, data: UpdatePageBody) {
  const page = await db.page.findUnique({
    where: { id },
    include: { game: { select: { ownerId: true } } },
  })
  if (!page) throw new NotFoundError('Página no encontrada')
  if (page.game.ownerId !== ownerId) throw new ForbiddenError()

  const newContent = data.content ?? page.content
  const plainText =
    data.content !== undefined ? extractPlainText(data.content) : page.plainText

  const updated = await db.page.update({
    where: { id },
    data: {
      title: data.title,
      icon: data.icon,
      content: newContent as object,
      attributes: data.attributes as object | undefined,
      parentId: data.parentId,
      orderIndex: data.orderIndex,
      plainText,
    },
  })

  if (data.content !== undefined) {
    const linkedIds = extractLinkedPageIds(data.content)
    await syncLinks(id, linkedIds)
  }

  return serializePage(updated)
}

export async function deletePage(id: string, ownerId: string) {
  const page = await db.page.findUnique({
    where: { id },
    include: { game: { select: { ownerId: true } } },
  })
  if (!page) throw new NotFoundError('Página no encontrada')
  if (page.game.ownerId !== ownerId) throw new ForbiddenError()

  await db.page.delete({ where: { id } })
}

export async function reorderPages(gameId: string, ownerId: string, body: ReorderBody) {
  const game = await db.game.findUnique({ where: { id: gameId } })
  if (!game) throw new NotFoundError('Juego no encontrado')
  if (game.ownerId !== ownerId) throw new ForbiddenError()

  await db.$transaction(
    body.items.map((item) =>
      db.page.update({
        where: { id: item.id },
        data: { parentId: item.parentId, orderIndex: item.orderIndex },
      }),
    ),
  )
}
