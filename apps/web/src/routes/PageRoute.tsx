import { useParams, Navigate } from 'react-router-dom'
import { useGame } from '../api/games'
import { usePageBySlug } from '../api/pages'
import { useGameMedia } from '../api/media'
import { useAuth } from '../hooks/useAuth'
import { AppShell } from '../components/layout/AppShell'
import { Editor } from '../components/editor/Editor'
import { EntityFields } from '../components/pages/EntityFields'
import { Backlinks } from '../components/pages/Backlinks'
import { MediaGallery } from '../components/pages/MediaGallery'
import { PAGE_TYPE_LABELS, ENTITY_TYPES } from '@wikigdd/shared'
import { formatDate } from '../lib/utils'

export function PageRoute() {
  const { gameSlug, pageSlug } = useParams<{ gameSlug: string; pageSlug: string }>()
  const auth = useAuth()
  const { data: gameData } = useGame(gameSlug ?? '')

  const { data: pageData, isLoading } = usePageBySlug(gameSlug ?? '', pageSlug ?? '')

  const gameId = gameData?.game?.id ?? ''
  const pageId = pageData?.page?.id ?? ''
  const { data: mediaData } = useGameMedia(gameId, pageId || undefined)

  if (isLoading) {
    return (
      <AppShell>
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      </AppShell>
    )
  }

  if (!pageData?.page) {
    return <Navigate to={`/games/${gameSlug}`} replace />
  }

  const page = pageData.page
  const isOwner =
    auth.status === 'authenticated' &&
    gameData?.game?.ownerId === auth.user.id

  const isEntity = ENTITY_TYPES.includes(page.type)

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            {page.icon && <span className="text-xl">{page.icon}</span>}
            <h1 className="text-xl font-bold text-gray-900">{page.title}</h1>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {PAGE_TYPE_LABELS[page.type]}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Actualizado {formatDate(page.updatedAt)}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <Editor
              pageId={page.id}
              gameId={gameId}
              initialContent={page.content}
              readOnly={!isOwner}
            />
          </div>

          {/* Side panel for entities */}
          {isEntity && (
            <aside className="w-56 shrink-0 space-y-4">
              <EntityFields
                pageId={page.id}
                type={page.type}
                attributes={page.attributes}
                canEdit={isOwner}
              />

              {(isOwner || (mediaData?.media ?? []).length > 0) && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Media
                  </h3>
                  <MediaGallery
                    gameId={gameId}
                    pageId={page.id}
                    media={mediaData?.media ?? []}
                    canEdit={isOwner}
                  />
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Backlinks */}
        {gameSlug && (
          <Backlinks backlinks={pageData.backlinks} gameSlug={gameSlug} />
        )}
      </div>
    </AppShell>
  )
}
