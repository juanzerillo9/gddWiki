import { db } from '../db'
import { NotFoundError, ForbiddenError } from '../lib/errors'
import type { PageType } from '@wikigdd/shared'

type SearchRow = {
  pageId: string
  title: string
  slug: string
  type: string
  snippet: string
  rank: number
}

export async function searchPages(gameId: string, query: string, userId?: string | null) {
  const game = await db.game.findUnique({ where: { id: gameId } })
  if (!game) throw new NotFoundError('Juego no encontrado')
  if (!game.isPublic && game.ownerId !== userId) throw new ForbiddenError()

  if (!query.trim()) return { results: [] }

  // Use PostgreSQL full-text search with tsvector
  const results = await db.$queryRaw<SearchRow[]>`
    SELECT
      p.id AS "pageId",
      p.title,
      p.slug,
      p.type,
      ts_headline(
        'spanish',
        p."plainText",
        websearch_to_tsquery('spanish', ${query}),
        'MaxFragments=1,MaxWords=15,MinWords=5'
      ) AS snippet,
      ts_rank(
        to_tsvector('spanish', coalesce(p."plainText", '') || ' ' || coalesce(p.title, '')),
        websearch_to_tsquery('spanish', ${query})
      ) AS rank
    FROM "Page" p
    WHERE
      p."gameId" = ${gameId}
      AND to_tsvector('spanish', coalesce(p."plainText", '') || ' ' || coalesce(p.title, ''))
          @@ websearch_to_tsquery('spanish', ${query})
    ORDER BY rank DESC
    LIMIT 20
  `

  return {
    results: results.map((r) => ({
      pageId: r.pageId,
      title: r.title,
      slug: r.slug,
      type: r.type as PageType,
      snippet: r.snippet ?? '',
      rank: Number(r.rank),
    })),
  }
}
