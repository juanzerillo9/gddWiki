import { useState } from 'react'
import { useUpdatePage } from '../../api/pages'
import { ENTITY_DEFAULT_FIELDS } from '@wikigdd/shared'
import type { PageType } from '@wikigdd/shared'

interface EntityFieldsProps {
  pageId: string
  type: PageType
  attributes: Record<string, string>
  canEdit?: boolean
}

export function EntityFields({ pageId, type, attributes, canEdit }: EntityFieldsProps) {
  const updatePage = useUpdatePage()
  const [localAttrs, setLocalAttrs] = useState<Record<string, string>>(attributes)
  const [newKey, setNewKey] = useState('')

  const suggestedKeys = ENTITY_DEFAULT_FIELDS[type] ?? []

  async function handleChange(key: string, value: string) {
    const updated = { ...localAttrs, [key]: value }
    setLocalAttrs(updated)
    await updatePage.mutateAsync({ id: pageId, data: { attributes: updated } })
  }

  async function handleAddKey(key: string) {
    if (!key.trim() || key in localAttrs) return
    const updated = { ...localAttrs, [key]: '' }
    setLocalAttrs(updated)
    setNewKey('')
    await updatePage.mutateAsync({ id: pageId, data: { attributes: updated } })
  }

  async function handleRemoveKey(key: string) {
    const updated = { ...localAttrs }
    delete updated[key]
    setLocalAttrs(updated)
    await updatePage.mutateAsync({ id: pageId, data: { attributes: updated } })
  }

  const missingDefaults = suggestedKeys.filter((k) => !(k in localAttrs))

  if (!canEdit && Object.keys(localAttrs).length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Atributos</h3>

      <div className="space-y-1.5">
        {Object.entries(localAttrs).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-32 shrink-0">{key}</span>
            {canEdit ? (
              <input
                className="input flex-1 text-sm py-1"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            ) : (
              <span className="text-sm text-gray-800">{value || '—'}</span>
            )}
            {canEdit && (
              <button
                onClick={() => handleRemoveKey(key)}
                className="text-gray-300 hover:text-red-500 text-xs px-1"
                title="Eliminar"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="pt-1 space-y-1">
          {missingDefaults.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {missingDefaults.map((k) => (
                <button
                  key={k}
                  onClick={() => handleAddKey(k)}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-600"
                >
                  + {k}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              className="input flex-1 text-xs py-1"
              placeholder="Nuevo campo..."
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddKey(newKey)
              }}
            />
            <button
              onClick={() => handleAddKey(newKey)}
              className="btn-secondary text-xs px-2 py-1"
              disabled={!newKey.trim()}
            >
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
