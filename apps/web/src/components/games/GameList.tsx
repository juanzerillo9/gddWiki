import type { GameResponse } from '@wikigdd/shared'
import { GameCard } from './GameCard'

interface GameListProps {
  games: GameResponse[]
  ownerId?: string
  userId?: string
  onDelete?: (id: string) => void
}

export function GameList({ games, ownerId, userId, onDelete }: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🗂️</p>
        <p className="text-sm">Todavía no tenés proyectos. ¡Creá el primero!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          canEdit={userId === ownerId || userId === game.ownerId}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
