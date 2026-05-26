function walkNode(node: unknown, parts: string[], ids: Set<string>): void {
  if (!node || typeof node !== 'object') return
  const obj = node as Record<string, unknown>

  if (typeof obj['text'] === 'string' && obj['text'].length > 0) {
    parts.push(obj['text'])
  }

  if (obj['type'] === 'pageLink' && obj['attrs'] && typeof obj['attrs'] === 'object') {
    const attrs = obj['attrs'] as Record<string, unknown>
    if (typeof attrs['pageId'] === 'string') ids.add(attrs['pageId'])
    if (typeof attrs['label'] === 'string') parts.push(attrs['label'])
  }

  if (Array.isArray(obj['content'])) {
    for (const child of obj['content'] as unknown[]) {
      walkNode(child, parts, ids)
    }
  }

  if (Array.isArray(obj['children'])) {
    for (const child of obj['children'] as unknown[]) {
      walkNode(child, parts, ids)
    }
  }
}

export function extractPlainText(content: unknown): string {
  const parts: string[] = []
  const ids = new Set<string>()
  if (Array.isArray(content)) {
    for (const block of content) walkNode(block, parts, ids)
  } else {
    walkNode(content, parts, ids)
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export function extractLinkedPageIds(content: unknown): string[] {
  const parts: string[] = []
  const ids = new Set<string>()
  if (Array.isArray(content)) {
    for (const block of content) walkNode(block, parts, ids)
  } else {
    walkNode(content, parts, ids)
  }
  return [...ids]
}
