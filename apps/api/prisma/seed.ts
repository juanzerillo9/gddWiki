import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env['ADMIN_EMAIL']
  const password = process.env['ADMIN_PASSWORD']
  const displayName = process.env['ADMIN_DISPLAY_NAME'] ?? 'Admin'

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment')
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    console.log(`Admin user already exists: ${email}`)
  } else {
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
    })
    console.log(`Created admin user: ${user.email} (id: ${user.id})`)
  }

  // Optional demo game
  if (process.env['SEED_DEMO'] === 'true') {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email } })
    const existingGame = await prisma.game.findUnique({ where: { slug: 'demo-game' } })

    if (!existingGame) {
      const game = await prisma.game.create({
        data: {
          ownerId: admin.id,
          title: 'Demo Game',
          slug: 'demo-game',
          description: 'Juego de demostración para explorar WikiGDD',
          isPublic: true,
        },
      })

      await prisma.page.createMany({
        data: [
          {
            gameId: game.id,
            type: 'doc',
            title: 'Visión / Concepto',
            slug: 'vision-concepto',
            icon: '🎯',
            orderIndex: 0,
            plainText: 'Demo game concept page',
          },
          {
            gameId: game.id,
            type: 'section',
            title: 'Personajes',
            slug: 'personajes',
            icon: '🧑',
            orderIndex: 1,
            plainText: '',
          },
          {
            gameId: game.id,
            type: 'doc',
            title: 'Gameplay & Mecánicas',
            slug: 'gameplay-mecanicas',
            icon: '🎮',
            orderIndex: 2,
            plainText: 'Core gameplay mechanics description',
          },
        ],
      })

      console.log(`Created demo game: ${game.slug}`)
    } else {
      console.log('Demo game already exists')
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
