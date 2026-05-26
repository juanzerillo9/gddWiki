import bcrypt from 'bcryptjs'
import { db } from '../db'
import { UnauthorizedError, ConflictError } from '../lib/errors'

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) throw new UnauthorizedError('Credenciales inválidas')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new UnauthorizedError('Credenciales inválidas')

  return { id: user.id, email: user.email, displayName: user.displayName }
}

export async function register(email: string, password: string, displayName: string) {
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) throw new ConflictError('El email ya está registrado')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await db.user.create({
    data: { email, passwordHash, displayName },
  })

  return { id: user.id, email: user.email, displayName: user.displayName }
}
