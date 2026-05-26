import type { FastifyPluginAsync } from 'fastify'
import { CreatePageBodySchema, UpdatePageBodySchema, ReorderBodySchema } from '@wikigdd/shared'
import {
  getPageTree,
  getPageDetail,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
} from '../services/page.service'

const pagesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/games/:gameId/pages — page tree
  fastify.get<{ Params: { gameId: string } }>(
    '/games/:gameId/pages',
    { preHandler: [fastify.optionalAuth] },
    async (request, reply) => {
      const result = await getPageTree(request.params.gameId)
      void reply.send(result)
    },
  )

  // GET /api/pages/:id — page detail by id
  fastify.get<{ Params: { id: string } }>(
    '/pages/:id',
    { preHandler: [fastify.optionalAuth] },
    async (request, reply) => {
      const result = await getPageDetail(request.params.id, request.authUser?.id)
      void reply.send(result)
    },
  )

  // GET /api/games/:gameSlug/pages/by-slug/:pageSlug — page detail by slug
  fastify.get<{ Params: { gameSlug: string; pageSlug: string } }>(
    '/games/:gameSlug/pages/by-slug/:pageSlug',
    { preHandler: [fastify.optionalAuth] },
    async (request, reply) => {
      const result = await getPageBySlug(
        request.params.gameSlug,
        request.params.pageSlug,
        request.authUser?.id,
      )
      void reply.send(result)
    },
  )

  // POST /api/games/:gameId/pages — create page
  fastify.post<{ Params: { gameId: string } }>(
    '/games/:gameId/pages',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      const body = CreatePageBodySchema.parse(request.body)
      const page = await createPage(request.params.gameId, request.authUser!.id, body)
      void reply.status(201).send({ page })
    },
  )

  // PATCH /api/pages/:id — update page
  fastify.patch<{ Params: { id: string } }>(
    '/pages/:id',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      const body = UpdatePageBodySchema.parse(request.body)
      const page = await updatePage(request.params.id, request.authUser!.id, body)
      void reply.send({ page })
    },
  )

  // DELETE /api/pages/:id — delete page
  fastify.delete<{ Params: { id: string } }>(
    '/pages/:id',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      await deletePage(request.params.id, request.authUser!.id)
      void reply.status(204).send()
    },
  )

  // POST /api/games/:gameId/pages/reorder — reorder pages
  fastify.post<{ Params: { gameId: string } }>(
    '/games/:gameId/pages/reorder',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      const body = ReorderBodySchema.parse(request.body)
      await reorderPages(request.params.gameId, request.authUser!.id, body)
      void reply.send({ ok: true })
    },
  )
}

export default pagesRoutes
