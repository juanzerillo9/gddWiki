import { useState } from 'react'
import { useGames, useCreateGame, useDeleteGame } from '../api/games'
import { GameList } from '../components/games/GameList'
import { useAuth } from '../hooks/useAuth'
import { useLogout } from '../api/auth'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPE_ICONS,
  PROJECT_TYPE_DESCRIPTIONS,
  type ProjectType,
} from '@wikigdd/shared'

export function GamesRoute() {
  const auth = useAuth()
  const navigate = useNavigate()
  const logout = useLogout()
  const { data, isLoading } = useGames()
  const createGame = useCreateGame()
  const deleteGame = useDeleteGame()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('videogame')
  const { theme, toggleTheme } = useTheme()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createGame.mutateAsync({
      title,
      description: description || undefined,
      projectType,
      applyTemplate: true,
    })
    setTitle('')
    setDescription('')
    setProjectType('videogame')
    setShowForm(false)
  }

  const userId = auth.status === 'authenticated' ? auth.user.id : undefined

  async function handleLogout() {
    await logout.mutateAsync()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between dark:bg-gray-900 dark:border-gray-700">
        <span className="font-bold text-brand-600 tracking-tight">botaholik</span>
        <div className="flex items-center gap-2">
          {auth.status === 'authenticated' && (
            <>
              <span className="text-sm text-gray-500 dark:text-gray-400">{auth.user.displayName}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              >
                Salir
              </button>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 dark:hover:bg-gray-800 dark:text-gray-400"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mis proyectos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Seleccioná un proyecto para continuar</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary"
          >
            + Nuevo proyecto
          </button>
        </div>

        {showForm && (
          <div className="card p-5 mb-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Nuevo proyecto</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Rogue Dungeon"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de proyecto *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {PROJECT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProjectType(type)}
                      className={[
                        'text-left p-3 rounded-lg border-2 transition-all',
                        projectType === type
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white dark:border-gray-600 dark:hover:border-gray-500 dark:bg-gray-800',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{PROJECT_TYPE_ICONS[type]}</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {PROJECT_TYPE_LABELS[type]}
                        </span>
                        {projectType === type && (
                          <span className="ml-auto text-brand-600 text-xs font-bold">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                        {PROJECT_TYPE_DESCRIPTIONS[type]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del proyecto..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createGame.isPending || !title.trim()}
                >
                  {createGame.isPending ? 'Creando...' : 'Crear proyecto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">Cargando...</div>
        ) : (
          <GameList
            games={data?.games ?? []}
            userId={userId}
            onDelete={(id) => deleteGame.mutate(id)}
          />
        )}
      </main>
    </div>
  )
}
