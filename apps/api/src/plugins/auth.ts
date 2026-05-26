import fp from 'fastify-plugin'
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedError } from '../lib/errors'
import { config } from '../config'
import { db } from '../db'

const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Cookie must be registered BEFORE jwt so tokens can be read from cookies
  await fastify.register(import('@fastify/cookie'))

  await fastify.register(import('@fastify/jwt'), {
    secret: config.JWT_SECRET,
    cookie: {
      cookieName: config.SESSION_COOKIE_NAME,
      signed: false,
    },
  })

  fastify.decorate(
    'requireAuth',
    async function (request: FastifyRequest, _reply: FastifyReply) {
      try {
        await request.jwtVerify()
        const payload = request.user as unknown as { sub: string }
        const user = await db.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, email: true, displayName: true },
        })
        if (!user) throw new UnauthorizedError()
        request.authUser = user
      } catch (err) {
        if (err instanceof UnauthorizedError) throw err
        throw new UnauthorizedError()
      }
    },
  )

  fastify.decorate(
    'optionalAuth',
    async function (request: FastifyRequest, _reply: FastifyReply) {
      try {
        await request.jwtVerify()
        const payload = request.user as unknown as { sub: string }
        const user = await db.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, email: true, displayName: true },
        })
        request.authUser = user
      } catch {
        request.authUser = null
      }
    },
  )
}

export default fp(authPlugin)
