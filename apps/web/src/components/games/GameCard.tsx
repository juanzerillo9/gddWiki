import { Link } from 'react-router-dom'
import type { GameResponse } from '@wikigdd/shared'
import { PROJECT_TYPE_LABELS, PROJECT_TYPE_ICONS } from '@wikigdd/shared'
import { formatDateShort } from '../../lib/utils'

interface GameCardProps {
  game: GameResponse
  onDelete?: (id: string) => void
  canEdit?: boolean
}

export function GameCard({ game, onDelete, canEdit }: GameCardProps) {
  const typeIcon = PROJECT_TYPE_ICONS[game.projectType] ?? '🗂️'
  const typeLabel = PROJECT_TYPE_LABELS[game.projectType] ?? game.projectType

  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {game.coverImage && (
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-32 object-cover rounded"
        />
      )}

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/games/${game.slug}`}
            className="text-base font-semibold text-gray-900 hover:text-brand-600 dark:text-gray-100 dark:hover:text-brand-500"
          >
            {typeIcon} {game.title}
          </Link>
          <div className="flex items-center gap-1 shrink-0">
            {game.isPublic && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                Público
              </span>
            )}
          </div>
        </div>

        <div className="mt-1">
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            {typeLabel}
          </span>
        </div>

        {game.description && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{game.description}</p>
        )}

        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Actualizado {formatDateShort(game.updatedAt)}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
        <Link
          to={`/games/${game.slug}`}
          className="btn-primary text-xs flex-1 text-center"
        >
          Abrir
        </Link>
        {canEdit && onDelete && (
          <button
            onClick={() => {
              if (confirm(`¿Eliminar "${game.title}" y todo su contenido?`)) {
                onDelete(game.id)
              }
            }}
            className="btn-secondary text-xs text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  )
}
