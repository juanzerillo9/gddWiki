import { db } from '../db'

export async function syncLinks(pageId: string, targetPageIds: string[]): Promise<void> {
  const unique = [...new Set(targetPageIds)].filter((id) => id !== pageId)

  await db.$transaction([
    db.pageLink.deleteMany({ where: { sourcePageId: pageId } }),
    ...(unique.length > 0
      ? [
          db.pageLink.createMany({
            data: unique.map((targetPageId) => ({ sourcePageId: pageId, targetPageId })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ])
}
