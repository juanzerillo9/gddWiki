import { useCallback, useRef } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { useUpdatePage } from '../../api/pages'

interface EditorProps {
  pageId: string
  gameId: string
  initialContent: Record<string, unknown>
  readOnly?: boolean
}

const AUTOSAVE_DEBOUNCE_MS = 800

export function Editor({ pageId, gameId, initialContent, readOnly }: EditorProps) {
  const updatePage = useUpdatePage()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useCreateBlockNote({
    initialContent: Array.isArray(initialContent)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (initialContent as any)
      : undefined,
    uploadFile: async (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/wiki/games/${gameId}/media`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Upload failed')
      const data = (await res.json()) as { media: { url: string } }
      return data.media.url
    },
  })

  const handleChange = useCallback(() => {
    if (readOnly) return

    if (saveTimer.current) clearTimeout(saveTimer.current)

    saveTimer.current = setTimeout(async () => {
      const content = editor.document as unknown as Record<string, unknown>
      await updatePage.mutateAsync({
        id: pageId,
        data: { content },
      })
    }, AUTOSAVE_DEBOUNCE_MS)
  }, [editor, pageId, readOnly, updatePage])

  return (
    <div className="relative">
      {updatePage.isPending && (
        <span className="absolute top-0 right-0 text-xs text-gray-400 z-10">Guardando…</span>
      )}
      <BlockNoteView
        editor={editor}
        editable={!readOnly}
        onChange={handleChange}
        theme="light"
      />
    </div>
  )
}
