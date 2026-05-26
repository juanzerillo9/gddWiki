import bcrypt from 'bcryptjs'
import { db } from '../db'
import { UnauthorizedError } from '../lib/errors'

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) throw new UnauthorizedError('Credenciales inválidas')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new UnauthorizedError('Credenciales inválidas')

  return { id: user.id, email: user.email, displayName: user.displayName }
}
