import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../api/auth'

export function LoginRoute() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login.mutateAsync({ email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError('Email o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🎮</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">WikiGDD</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Game Design Document Wiki</p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded dark:bg-red-900/30 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={login.isPending}
            >
              {login.isPending ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
