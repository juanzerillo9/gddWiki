import { Link, useNavigate } from 'react-router-dom'
import { useLogout } from '../../api/auth'
import { useAuth } from '../../hooks/useAuth'
import { useGame } from '../../api/games'
import { useTheme } from '../../context/ThemeContext'

interface TopBarProps {
  onMenuClick: () => void
  gameSlug?: string
}

export function TopBar({ onMenuClick, gameSlug }: TopBarProps) {
  const navigate = useNavigate()
  const logout = useLogout()
  const auth = useAuth()
  const { data: gameData } = useGame(gameSlug ?? '')
  const { theme, toggleTheme } = useTheme()

  async function handleLogout() {
    await logout.mutateAsync()
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 shrink-0 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center gap-3">
        {/* Hamburger for mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb */}
        <Link to="/games" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          botaholik
        </Link>
        {gameData?.game && (
          <>
            <span className="text-gray-400 dark:text-gray-600">/</span>
            <Link
              to={`/games/${gameData.game.slug}`}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 truncate max-w-[200px] dark:text-gray-300 dark:hover:text-gray-100"
            >
              {gameData.game.title}
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {gameSlug && (
          <Link
            to={`/games/${gameSlug}/search`}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 dark:hover:bg-gray-800 dark:text-gray-400"
            title="Buscar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        )}

        {/* Dark mode toggle */}
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

        {auth.status === 'authenticated' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:block dark:text-gray-400">{auth.user.displayName}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
