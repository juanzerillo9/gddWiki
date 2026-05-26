import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { PageTreeNode } from '@wikigdd/shared'

interface PageTreeProps {
  nodes: PageTreeNode[]
  gameSlug: string
  depth?: number
  onNavigate?: () => void
}

export function PageTree({ nodes, gameSlug, depth = 0, onNavigate }: PageTreeProps) {
  return (
    <ul className={depth > 0 ? 'ml-3 border-l border-gray-100 dark:border-gray-700 pl-2' : ''}>
      {nodes.map((node) => (
        <PageTreeItem
          key={node.id}
          node={node}
          gameSlug={gameSlug}
          depth={depth}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  )
}

function PageTreeItem({
  node,
  gameSlug,
  depth,
  onNavigate,
}: {
  node: PageTreeNode
  gameSlug: string
  depth: number
  onNavigate?: () => void
}) {
  const { pageSlug } = useParams<{ pageSlug: string }>()
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = node.children.length > 0
  const isActive = pageSlug === node.slug

  return (
    <li>
      <div
        className={`
          flex items-center gap-1 rounded px-2 py-1.5 text-sm cursor-pointer group
          ${isActive
            ? 'bg-brand-50 text-brand-700 font-medium dark:bg-brand-900/30 dark:text-brand-400'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
        `}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="shrink-0 w-4" />
        )}

        <Link
          to={`/games/${gameSlug}/pages/${node.slug}`}
          onClick={onNavigate}
          className="flex items-center gap-1.5 flex-1 min-w-0"
        >
          {node.icon && <span className="shrink-0">{node.icon}</span>}
          <span className="truncate">{node.title}</span>
        </Link>
      </div>

      {hasChildren && expanded && (
        <PageTree
          nodes={node.children}
          gameSlug={gameSlug}
          depth={depth + 1}
          onNavigate={onNavigate}
        />
      )}
    </li>
  )
}
