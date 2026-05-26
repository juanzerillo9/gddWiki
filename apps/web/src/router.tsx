import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LandingRoute } from './routes/LandingRoute'
import { LoginRoute } from './routes/LoginRoute'
import { RegisterRoute } from './routes/RegisterRoute'
import { GamesRoute } from './routes/GamesRoute'
import { GameRoute } from './routes/GameRoute'
import { PageRoute } from './routes/PageRoute'
import { SearchRoute } from './routes/SearchRoute'
import { VersionsRoute } from './routes/VersionsRoute'
import { AuthGuard } from './components/layout/AuthGuard'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: '/',
    element: <LandingRoute />,
  },
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/register',
    element: <RegisterRoute />,
  },
  {
    path: '/games',
    element: <AuthGuard />,
    children: [
      {
        index: true,
        element: <GamesRoute />,
      },
      {
        path: ':gameSlug',
        element: <GameRoute />,
      },
      {
        path: ':gameSlug/pages/:pageSlug',
        element: <PageRoute />,
      },
      {
        path: ':gameSlug/search',
        element: <SearchRoute />,
      },
      {
        path: ':gameSlug/versions',
        element: <VersionsRoute />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
