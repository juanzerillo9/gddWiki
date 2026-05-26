import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginRoute } from './routes/LoginRoute'
import { GamesRoute } from './routes/GamesRoute'
import { GameRoute } from './routes/GameRoute'
import { PageRoute } from './routes/PageRoute'
import { SearchRoute } from './routes/SearchRoute'
import { VersionsRoute } from './routes/VersionsRoute'
import { AuthGuard } from './components/layout/AuthGuard'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        index: true,
        element: <GamesRoute />,
      },
      {
        path: 'games/:gameSlug',
        element: <GameRoute />,
      },
      {
        path: 'games/:gameSlug/pages/:pageSlug',
        element: <PageRoute />,
      },
      {
        path: 'games/:gameSlug/search',
        element: <SearchRoute />,
      },
      {
        path: 'games/:gameSlug/versions',
        element: <VersionsRoute />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
