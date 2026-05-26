import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGame } from '../api/games'
import { AppShell } from '../components/layout/AppShell'
import { PAGE_TYPE_LABELS } from '@wikigdd/shared'
import type { SearchResult } from '@wikigdd/shared'
import { apiClient } from '../api/client'

export function SearchRoute() {
  const { gameSlug } = useParams<{ gameSlug: string }>()
  const { data: gameData } = useGame(gameSlug ?? '')
  const gameId = gameData?.game?.id ?? ''

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!gameId || !query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const data = await apiClient.get<{ results: SearchResult[] }>(
        `/games/${gameId}/search?q=${encodeURIComponent(query)}`,
      )
      setResults(data.results)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Buscar en la wiki</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="search"
            className="input flex-1"
            placeholder="Buscar páginas, personajes, mecánicas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
            {loading ? '...' : 'Buscar'}
          </button>
        </form>

        {searched && !loading && results.length === 0 && (
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">
            Sin resultados para "{query}"
          </p>
        )}

        {results.length > 0 && (
          <ul className="space-y-3">
            {results.map((r) => (
              <li key={r.pageId} className="card p-4">
                <Link
                  to={`/games/${gameSlug}/pages/${r.slug}`}
                  className="font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                >
                  {r.title}
                </Link>
                <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded dark:text-gray-400 dark:bg-gray-700">
                  {PAGE_TYPE_LABELS[r.type]}
                </span>
                {r.snippet && (
                  <p
                    className="mt-1 text-sm text-gray-600 dark:text-gray-400"
                    dangerouslySetInnerHTML={{ __html: r.snippet }}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  )
}
