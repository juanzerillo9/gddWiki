// ImageUpload is handled directly inside Editor.tsx via the
// `uploadFile` option of `useCreateBlockNote`.
// This file exposes utilities for external image upload UI (e.g. MediaGallery).

export async function uploadImageToGame(
  file: File,
  gameId: string,
): Promise<{ url: string; id: string }> {
  const fd = new FormData()
  fd.append('file', file)

  const res = await fetch(`/wiki/games/${gameId}/media`, {
    method: 'POST',
    body: fd,
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Error al subir la imagen')
  }

  const data = (await res.json()) as { media: { url: string; id: string } }
  return data.media
}
