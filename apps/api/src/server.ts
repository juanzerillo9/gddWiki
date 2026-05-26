import { buildApp } from './app'
import { config } from './config'

async function main() {
  const app = await buildApp()

  await app.listen({
    port: config.PORT,
    host: '0.0.0.0',
  })

  console.log(`✅ WikiGDD API running on http://0.0.0.0:${config.PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
