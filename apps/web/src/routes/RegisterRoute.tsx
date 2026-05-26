import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '../api/auth'

export function RegisterRoute() {
  const navigate = useNavigate()
  const register = useRegister()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await register.mutateAsync({ displayName, email, password })
      navigate('/games', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? ''
      if (msg.includes('409') || msg.toLowerCase().includes('conflict') || msg.includes('registrado')) {
        setError('Ese email ya está registrado. ¿Querés iniciar sesión?')
      } else if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
      } else {
        setError('Ocurrió un error. Intentá de nuevo.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-extrabold text-brand-600 tracking-tight">
            botaholik
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Creá tu cuenta gratis</p>
        </div>

        <div className="card p-6">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Registrarse</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <input
                type="text"
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre o apodo"
                required
                autoFocus
                minLength={2}
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={register.isPending}
            >
              {register.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
