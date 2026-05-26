import Fastify from 'fastify'
import path from 'path'
import { errorHandler } from './lib/errors'
import authPlugin from './plugins/auth'
import corsPlugin from './plugins/cors'
import multipartPlugin from './plugins/multipart'
import authRoutes from './routes/auth.routes'
import gamesRoutes from './routes/games.routes'
import pagesRoutes from './routes/pages.routes'
import mediaRoutes from './routes/media.routes'
import versionsRoutes from './routes/versions.routes'
import searchRoutes from './routes/search.routes'
import { config } from './config'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'development' ? 'debug' : 'info',
    },
  })

  // Error handler
  app.setErrorHandler(errorHandler)

  // Plugins
  await app.register(corsPlugin)
  await app.register(authPlugin)
  await app.register(multipartPlugin)

  // Serve uploaded media files
  await app.register(import('@fastify/static'), {
    root: path.resolve(config.UPLOAD_DIR),
    prefix: '/wiki/media/',
    decorateReply: false,
  })

  // Health check
  app.get('/wiki/health', async (_request, reply) => {
    void reply.send({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Routes under /wiki prefix
  await app.register(
    async (api) => {
      await api.register(authRoutes)
      await api.register(gamesRoutes)
      await api.register(pagesRoutes)
      await api.register(mediaRoutes)
      await api.register(versionsRoutes)
      await api.register(searchRoutes)
    },
    { prefix: '/wiki' },
  )

  return app
}
