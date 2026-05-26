import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { config } from '../config'

const multipartPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: config.MAX_UPLOAD_MB * 1024 * 1024,
      files: 1,
    },
  })
}

export default fp(multipartPlugin)
