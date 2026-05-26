import type { FastifyPluginAsync } from 'fastify'
import { LoginBodySchema, RegisterBodySchema } from '@wikigdd/shared'
import { login, register } from '../services/auth.service'
import { config } from '../config'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/auth/register
  fastify.post('/auth/register', async (request, reply) => {
    const body = RegisterBodySchema.parse(request.body)
    const user = await register(body.email, body.password, body.displayName)

    const ttlSeconds = config.SESSION_TTL_DAYS * 24 * 60 * 60
    const token = fastify.jwt.sign({ sub: user.id }, { expiresIn: ttlSeconds })

    void reply
      .setCookie(config.SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ttlSeconds,
      })
      .status(201)
      .send({ user })
  })

  // POST /api/auth/login
  fastify.post('/auth/login', async (request, reply) => {
    const body = LoginBodySchema.parse(request.body)
    const user = await login(body.email, body.password)

    const ttlSeconds = config.SESSION_TTL_DAYS * 24 * 60 * 60
    const token = fastify.jwt.sign({ sub: user.id }, { expiresIn: ttlSeconds })

    void reply
      .setCookie(config.SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ttlSeconds,
      })
      .status(200)
      .send({ user })
  })

  // POST /api/auth/logout
  fastify.post(
    '/auth/logout',
    { preHandler: [fastify.requireAuth] },
    async (_request, reply) => {
      void reply
        .clearCookie(config.SESSION_COOKIE_NAME, { path: '/' })
        .status(200)
        .send({ ok: true })
    },
  )

  // GET /api/auth/me
  fastify.get(
    '/auth/me',
    { preHandler: [fastify.requireAuth] },
    async (request, reply) => {
      void reply.send({ user: request.authUser })
    },
  )
}

export default authRoutes
