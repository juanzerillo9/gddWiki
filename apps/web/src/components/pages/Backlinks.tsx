import { Link } from 'react-router-dom'
import type { BacklinkRef } from '@wikigdd/shared'
import { PAGE_TYPE_LABELS } from '@wikigdd/shared'

interface BacklinksProps {
  backlinks: BacklinkRef[]
  gameSlug: string
}

export function Backlinks({ backlinks, gameSlug }: BacklinksProps) {
  if (backlinks.length === 0) return null

  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Mencionado en ({backlinks.length})
      </h3>
      <ul className="space-y-1">
        {backlinks.map((bl) => (
          <li key={bl.id}>
            <Link
              to={`/games/${gameSlug}/pages/${bl.slug}`}
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 hover:underline"
            >
              <span className="text-xs text-gray-400">{PAGE_TYPE_LABELS[bl.type]}</span>
              {bl.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
