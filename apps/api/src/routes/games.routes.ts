import type { FastifyPluginAsync } from 'fastify'
import { CreateGameBodySchema, UpdateGameBodySchema } from '@wikigdd/shared'
import {
  listGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
} from '../services/game.service'

const gamesRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/games — list user's games
  fastify.get(
    '/games',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      const games = await listGames(request.authUser!.id)
      void reply.send({ games })
    },
  )

  // GET /api/games/:slug — get game by slug (public if isPublic)
  fastify.get<{ Params: { slug: string } }>(
    '/games/:slug',
    { preHandler: [fastify.optionalAuth] },
    async (request, reply) => {
      const game = await getGame(request.params.slug, request.authUser?.id)
      void reply.send({ game })
    },
  )

  // POST /api/games — create game
  fastify.post(
    '/games',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      const body = CreateGameBodySchema.parse(request.body)
      const game = await createGame(request.authUser!.id, body)
      void reply.status(201).send({ game })
    },
  )

  // PATCH /api/games/:id — update game
  fastify.patch<{ Params: { id: string } }>(
    '/games/:id',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      const body = UpdateGameBodySchema.parse(request.body)
      const game = await updateGame(request.params.id, request.authUser!.id, body)
      void reply.send({ game })
    },
  )

  // DELETE /api/games/:id — delete game
  fastify.delete<{ Params: { id: string } }>(
    '/games/:id',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      await deleteGame(request.params.id, request.authUser!.id)
      void reply.status(204).send()
    },
  )
}

export default gamesRoutes
