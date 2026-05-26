import { useRef, useState } from 'react'
import { useUploadMedia } from '../../api/media'
import type { MediaResponse } from '@wikigdd/shared'

interface MediaGalleryProps {
  gameId: string
  pageId?: string
  media: MediaResponse[]
  canEdit?: boolean
  onInsert?: (url: string) => void
}

export function MediaGallery({ gameId, pageId, media, canEdit, onInsert }: MediaGalleryProps) {
  const uploadMedia = useUploadMedia(gameId)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<MediaResponse | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadMedia.mutateAsync({ file, pageId })
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {canEdit && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary text-xs"
            disabled={uploadMedia.isPending}
          >
            {uploadMedia.isPending ? 'Subiendo...' : '+ Subir imagen'}
          </button>
        </div>
      )}

      {media.length === 0 && (
        <p className="text-xs text-gray-400 italic">Sin archivos aún</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {media.map((m) => (
          <div
            key={m.id}
            className={`
              relative group rounded overflow-hidden border-2 cursor-pointer
              ${selected?.id === m.id ? 'border-brand-500' : 'border-transparent hover:border-gray-300'}
            `}
            onClick={() => {
              setSelected(m)
              onInsert?.(m.url)
            }}
          >
            <img
              src={m.url}
              alt={m.fileName}
              className="w-full h-20 object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
              {m.fileName}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
