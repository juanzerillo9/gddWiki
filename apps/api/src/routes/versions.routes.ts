import type { FastifyPluginAsync } from 'fastify'
import { CreateVersionBodySchema } from '@wikigdd/shared'
import {
  listVersions,
  getVersion,
  createVersion,
  restoreVersion,
  deleteVersion,
} from '../services/version.service'

const versionsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/games/:gameId/versions — list versions
  fastify.get<{ Params: { gameId: string } }>(
    '/games/:gameId/versions',
    { preHandler: [fastify.optionalAuth] },
    async (request, reply) => {
      const versions = await listVersions(request.params.gameId, request.authUser?.id)
      void reply.send({ versions })
    },
  )

  // GET /api/versions/:id — get version detail
  fastify.get<{ Params: { id: string } }>(
    '/versions/:id',
    { preHandler: [fastify.optionalAuth] },
    async (request, reply) => {
      const version = await getVersion(request.params.id, request.authUser?.id)
      void reply.send({ version })
    },
  )

  // POST /api/games/:gameId/versions — create version
  fastify.post<{ Params: { gameId: string } }>(
    '/games/:gameId/versions',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      const body = CreateVersionBodySchema.parse(request.body)
      const version = await createVersion(request.params.gameId, request.authUser!.id, body)
      void reply.status(201).send({ version })
    },
  )

  // POST /api/versions/:id/restore — restore version
  fastify.post<{ Params: { id: string } }>(
    '/versions/:id/restore',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      const result = await restoreVersion(request.params.id, request.authUser!.id)
      void reply.send(result)
    },
  )

  // DELETE /api/versions/:id — delete version
  fastify.delete<{ Params: { id: string } }>(
    '/versions/:id',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      await deleteVersion(request.params.id, request.authUser!.id)
      void reply.status(204).send()
    },
  )
}

export default versionsRoutes
