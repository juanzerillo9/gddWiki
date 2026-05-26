import { db } from '../db'
import { NotFoundError, ForbiddenError } from '../lib/errors'
import { uniqueSlug } from '../lib/slug'
import { PROJECT_TEMPLATES } from '@wikigdd/shared'
import type { CreateGameBody, UpdateGameBody, ProjectType } from '@wikigdd/shared'

function serializeGame(game: {
  id: string
  ownerId: string
  title: string
  slug: string
  description: string | null
  coverImage: string | null
  isPublic: boolean
  projectType: string
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...game,
    projectType: game.projectType as ProjectType,
    createdAt: game.createdAt.toISOString(),
    updatedAt: game.updatedAt.toISOString(),
  }
}

export async function listGames(ownerId: string) {
  const games = await db.game.findMany({
    where: { ownerId },
    orderBy: { updatedAt: 'desc' },
  })
  return games.map(serializeGame)
}

export async function getGame(slugOrId: string, userId?: string | null) {
  const game = await db.game.findFirst({
    where: {
      OR: [{ slug: slugOrId }, { id: slugOrId }],
    },
  })

  if (!game) throw new NotFoundError('Proyecto no encontrado')
  if (!game.isPublic && game.ownerId !== userId) throw new ForbiddenError()

  return serializeGame(game)
}

export async function createGame(ownerId: string, data: CreateGameBody) {
  const slug = await uniqueSlug(data.title, async (s) => {
    const exists = await db.game.findUnique({ where: { slug: s } })
    return exists !== null
  })

  const projectType = data.projectType ?? 'videogame'

  const game = await db.game.create({
    data: {
      ownerId,
      title: data.title,
      slug,
      description: data.description ?? null,
      projectType,
    },
  })

  if (data.applyTemplate !== false) {
    await applyTemplate(game.id, projectType)
  }

  return serializeGame(game)
}

async function applyTemplate(gameId: string, projectType: ProjectType) {
  const template = PROJECT_TEMPLATES[projectType] ?? PROJECT_TEMPLATES.videogame
  for (let i = 0; i < template.length; i++) {
    const node = template[i]
    if (!node) continue
    await db.page.create({
      data: {
        gameId,
        type: node.type,
        title: node.title,
        slug: slugFromTitle(node.title),
        icon: node.icon ?? null,
        orderIndex: i,
        content: {},
        attributes: {},
      },
    })
  }
}

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function updateGame(id: string, ownerId: string, data: UpdateGameBody) {
  const game = await db.game.findUnique({ where: { id } })
  if (!game) throw new NotFoundError('Proyecto no encontrado')
  if (game.ownerId !== ownerId) throw new ForbiddenError()

  const updated = await db.game.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      isPublic: data.isPublic,
      coverImage: data.coverImage,
    },
  })

  return serializeGame(updated)
}

export async function deleteGame(id: string, ownerId: string) {
  const game = await db.game.findUnique({ where: { id } })
  if (!game) throw new NotFoundError('Proyecto no encontrado')
  if (game.ownerId !== ownerId) throw new ForbiddenError()

  await db.game.delete({ where: { id } })
}
