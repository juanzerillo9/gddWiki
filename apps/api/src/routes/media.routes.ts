import type { FastifyPluginAsync } from 'fastify'
import { uploadMedia, listMedia, deleteMedia } from '../services/media.service'

const mediaRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/games/:gameId/media — upload file
  fastify.post<{ Params: { gameId: string } }>(
    '/games/:gameId/media',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      const file = await request.file()
      if (!file) {
        void reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'No file provided', details: null } })
        return
      }

      const fields = file.fields as Record<string, { value: string } | undefined>
      const pageId = fields['pageId']?.value
      const kind = fields['kind']?.value

      const media = await uploadMedia(
        request.params.gameId,
        request.authUser!.id,
        file,
        pageId,
        kind,
      )

      void reply.status(201).send({ media })
    },
  )

  // GET /api/games/:gameId/media — list media
  fastify.get<{ Params: { gameId: string }; Querystring: { pageId?: string } }>(
    '/games/:gameId/media',
    { preHandler: [fastify.optionalAuth] },
    async (request, reply) => {
      const media = await listMedia(
        request.params.gameId,
        request.authUser?.id,
        request.query.pageId,
      )
      void reply.send({ media })
    },
  )

  // DELETE /api/media/:id — delete media
  fastify.delete<{ Params: { id: string } }>(
    '/media/:id',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      await deleteMedia(request.params.id, request.authUser!.id)
      void reply.status(204).send()
    },
  )
}

export default mediaRoutes
