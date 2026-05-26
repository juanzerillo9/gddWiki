import { Link } from 'react-router-dom'
import { usePageTree, useCreatePage } from '../../api/pages'
import { useGame } from '../../api/games'
import { useAuth } from '../../hooks/useAuth'
import { PageTree } from '../pages/PageTree'

interface SidebarProps {
  gameSlug?: string
  onClose?: () => void
}

export function Sidebar({ gameSlug, onClose }: SidebarProps) {
  const auth = useAuth()
  const { data: gameData } = useGame(gameSlug ?? '')
  const gameId = gameData?.game?.id ?? ''
  const { data: treeData } = usePageTree(gameId)
  const createPage = useCreatePage(gameId)

  const isOwner =
    auth.status === 'authenticated' &&
    gameData?.game?.ownerId === auth.user.id

  async function handleNewPage() {
    if (!gameId) return
    const title = prompt('Título de la nueva página:')
    if (!title) return
    await createPage.mutateAsync({ title, type: 'doc' })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/games" className="text-sm font-bold text-brand-600" onClick={onClose}>
          ← botaholik
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      {/* Game info */}
      {gameData?.game && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Juego</p>
          <Link
            to={`/games/${gameSlug}`}
            className="text-sm font-medium text-gray-800 hover:text-brand-600 dark:text-gray-200 dark:hover:text-brand-500"
            onClick={onClose}
          >
            🎮 {gameData.game.title}
          </Link>
        </div>
      )}

      {/* Navigation links */}
      {gameSlug && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 space-y-0.5">
          <Link
            to={`/games/${gameSlug}/search`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            🔍 Buscar
          </Link>
          <Link
            to={`/games/${gameSlug}/versions`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            🗂️ Versiones
          </Link>
        </div>
      )}

      {/* Page tree */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {treeData?.tree && gameSlug && (
          <PageTree
            nodes={treeData.tree}
            gameSlug={gameSlug}
            onNavigate={onClose}
          />
        )}
      </div>

      {/* New page button */}
      {isOwner && gameId && (
        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleNewPage}
            className="w-full btn-secondary text-xs"
            disabled={createPage.isPending}
          >
            + Nueva página
          </button>
        </div>
      )}
    </div>
  )
}
