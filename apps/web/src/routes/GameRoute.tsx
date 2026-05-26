import { useParams, Navigate } from 'react-router-dom'
import { useGame } from '../api/games'
import { usePageTree } from '../api/pages'
import { AppShell } from '../components/layout/AppShell'
import { PageTree } from '../components/pages/PageTree'
import { formatDateShort } from '../lib/utils'

export function GameRoute() {
  const { gameSlug } = useParams<{ gameSlug: string }>()
  const { data: gameData, isLoading, error } = useGame(gameSlug ?? '')
  const { data: treeData } = usePageTree(gameData?.game?.id ?? '')

  if (isLoading) {
    return (
      <AppShell>
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      </AppShell>
    )
  }

  if (error || !gameData?.game) {
    return <Navigate to="/" replace />
  }

  const game = gameData.game

  return (
    <AppShell>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">🎮 {game.title}</h1>
          {game.description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">{game.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Actualizado {formatDateShort(game.updatedAt)} ·{' '}
            {game.isPublic ? '🌐 Público' : '🔒 Privado'}
          </p>
        </div>

        {treeData?.tree && treeData.tree.length > 0 && (
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Contenido
            </h2>
            <nav>
              <PageTree nodes={treeData.tree} gameSlug={gameSlug!} />
            </nav>
          </div>
        )}

        {(!treeData?.tree || treeData.tree.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            <p>Esta wiki está vacía. Empezá creando una página desde el menú lateral.</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
