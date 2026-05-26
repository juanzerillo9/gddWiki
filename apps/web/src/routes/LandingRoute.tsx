import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'

const FEATURES = [
  {
    icon: '📝',
    title: 'Wiki estructurada',
    desc: 'Creá páginas para personajes, mecánicas, niveles, objetos y más. Todo organizado en una jerarquía clara.',
  },
  {
    icon: '🗂️',
    title: 'Control de versiones',
    desc: 'Guardá snapshots de tu proyecto en cada milestone. Restaurá cualquier versión anterior cuando quieras.',
  },
  {
    icon: '🔍',
    title: 'Búsqueda instantánea',
    desc: 'Encontrá cualquier página de tu GDD al instante. Sin perder tiempo navegando.',
  },
  {
    icon: '🎮',
    title: 'Multi-proyecto',
    desc: 'Manejá videojuegos, juegos de mesa, novelas, apps y más desde un solo lugar.',
  },
]

export function LandingRoute() {
  const auth = useAuth()
  const { theme, toggleTheme } = useTheme()

  if (auth.status === 'authenticated') {
    return <Navigate to="/games" replace />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold text-brand-600 tracking-tight">botaholik</span>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
            aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
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
          <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium">
            Iniciar sesión
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Crear cuenta gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-brand-100 dark:border-brand-800">
          🚀 Tu app para documentar y planificar
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-50 leading-tight tracking-tight mb-6">
          Tus ideas merecen<br />
          <span className="text-brand-600">un buen documento</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Botaholik es la plataforma para crear y organizar el <strong className="text-gray-700 dark:text-gray-300">Game Design Document</strong> de tu proyecto.
          Videojuegos, juegos de mesa, novelas, apps — todo en una wiki estructurada con control de versiones.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link to="/register" className="btn-primary text-base px-6 py-2.5 w-full sm:w-auto">
            Empezar gratis
          </Link>
          <Link to="/login" className="btn-secondary text-base px-6 py-2.5 w-full sm:w-auto">
            Ya tengo cuenta
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">Sin tarjeta de crédito · Gratis para siempre</p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
            Todo lo que necesitás para planificar
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-sm">
            Diseñado para creadores que quieren mantener sus ideas organizadas
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          ¿Listo para documentar tu próximo proyecto?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          Unite a botaholik y dale estructura a tus ideas.
        </p>
        <Link to="/register" className="btn-primary text-base px-8 py-2.5">
          Crear mi cuenta
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-sm font-semibold text-brand-600">botaholik.uno</span>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} Botaholik — Documentá y planificá tu proyecto creativo
          </p>
        </div>
      </footer>
    </div>
  )
}
