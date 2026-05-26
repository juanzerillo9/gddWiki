import type { UserResponse } from '@wikigdd/shared'

declare module 'fastify' {
  interface FastifyRequest {
    authUser: UserResponse | null
  }

  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
