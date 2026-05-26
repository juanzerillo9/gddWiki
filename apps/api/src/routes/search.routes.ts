import type { FastifyPluginAsync } from 'fastify'
import { searchPages } from '../services/search.service'

const searchRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/games/:gameId/search?q=
  fastify.get<{
    Params: { gameId: string }
    Querystring: { q?: string }
  }>(
    '/games/:gameId/search',
    { preHandler: [fastify.optionalAuth] },
    async (request, reply) => {
      const q = request.query.q ?? ''
      const results = await searchPages(request.params.gameId, q, request.authUser?.id)
      void reply.send(results)
    },
  )
}

export default searchRoutes
