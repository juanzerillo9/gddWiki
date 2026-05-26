import type { PageType } from '../schemas/page'
import type { MediaResponse } from '../schemas/media'

export type BlockNoteJSON = Record<string, unknown>

export type PageTreeNode = {
  id: string
  title: string
  slug: string
  type: PageType
  icon: string | null
  orderIndex: number
  children: PageTreeNode[]
}

export type BacklinkRef = {
  id: string
  title: string
  slug: string
  type: PageType
}

export type PageDetailResponse = {
  page: {
    id: string
    gameId: string
    parentId: string | null
    type: PageType
    title: string
    slug: string
    icon: string | null
    content: BlockNoteJSON
    attributes: Record<string, string>
    orderIndex: number
    createdAt: string
    updatedAt: string
  }
  backlinks: BacklinkRef[]
  media: MediaResponse[]
}

export type SearchResult = {
  pageId: string
  title: string
  slug: string
  type: PageType
  snippet: string
  rank: number
}

export type ApiError = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
