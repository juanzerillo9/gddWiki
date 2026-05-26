import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { config } from '../config'

const corsPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(import('@fastify/cors'), {
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
}

export default fp(corsPlugin)
