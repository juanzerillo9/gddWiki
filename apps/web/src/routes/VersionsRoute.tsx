import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGame } from '../api/games'
import {
  useVersions,
  useCreateVersion,
  useRestoreVersion,
  useDeleteVersion,
} from '../api/versions'
import { useAuth } from '../hooks/useAuth'
import { AppShell } from '../components/layout/AppShell'
import { formatDate } from '../lib/utils'

export function VersionsRoute() {
  const { gameSlug } = useParams<{ gameSlug: string }>()
  const auth = useAuth()
  const { data: gameData } = useGame(gameSlug ?? '')
  const gameId = gameData?.game?.id ?? ''

  const { data: versionsData, isLoading } = useVersions(gameId)
  const createVersion = useCreateVersion(gameId)
  const restoreVersion = useRestoreVersion(gameId)
  const deleteVersion = useDeleteVersion(gameId)

  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [notes, setNotes] = useState('')

  const isOwner =
    auth.status === 'authenticated' &&
    gameData?.game?.ownerId === auth.user.id

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createVersion.mutateAsync({ versionLabel: label, notes: notes || undefined })
    setLabel('')
    setNotes('')
    setShowForm(false)
  }

  async function handleRestore(id: string, label: string) {
    if (!confirm(`¿Restaurar a "${label}"? El estado actual se guardará como auto-backup.`)) return
    await restoreVersion.mutateAsync(id)
    alert('Restauración completada.')
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Versiones del GDD</h1>
          {isOwner && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="btn-primary"
            >
              + Crear versión
            </button>
          )}
        </div>

        {showForm && (
          <div className="card p-5 mb-6">
            <h2 className="text-base font-semibold mb-3 dark:text-gray-200">Nueva versión</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Etiqueta *
                </label>
                <input
                  className="input"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ej: v0.3 - Vertical slice"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Cambios incluidos en esta versión..."
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
                  disabled={createVersion.isPending || !label.trim()}
                >
                  {createVersion.isPending ? 'Guardando...' : 'Guardar versión'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">Cargando...</div>
        )}

        {!isLoading && versionsData?.versions?.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p className="text-3xl mb-2">🗂️</p>
            <p className="text-sm">No hay versiones guardadas aún.</p>
          </div>
        )}

        <ul className="space-y-3">
          {versionsData?.versions?.map((v) => (
            <li key={v.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{v.versionLabel}</p>
                  {v.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{v.notes}</p>}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(v.createdAt)}</p>
                </div>

                {isOwner && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleRestore(v.id, v.versionLabel)}
                      className="btn-secondary text-xs"
                      disabled={restoreVersion.isPending}
                    >
                      Restaurar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la versión "${v.versionLabel}"?`)) {
                          deleteVersion.mutate(v.id)
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700 px-2 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  )
}
