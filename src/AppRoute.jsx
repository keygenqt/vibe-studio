import * as React from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router'
import { Box } from '@mui/material'

import {
  ErrorPage,
  GeneralPage,
  MainPage,
  ModelPage,
  ProviderPage,
  ProvidersPage,
  SettingsPage,
} from './pages'

const router = createBrowserRouter([
  {
    element: (
      <PageFade>
        <Outlet />
      </PageFade>
    ),
    children: [
      { index: true, element: <MainPage /> },
      {
        path: 'settings',
        element: <SettingsPage />,
        children: [
          { index: true, element: <Navigate replace to="/settings/general" /> },
          { path: 'general', element: <GeneralPage /> },
          { path: 'providers', element: <ProvidersPage /> },
          { path: 'provider/add', element: <ProviderPage /> },
          { path: 'provider/:providerId', element: <ProviderPage /> },
          { path: 'model/:modelId', element: <ModelPage /> },
        ],
      },
      { path: '*', element: <ErrorPage /> },
    ],
  },
])

export function AppRoute() {
  return <RouterProvider router={router} />
}

// remounts on section change; the fade-in is the fallback for
// webviews without view transitions
// the first mount (app start) renders without the fade
function PageFade(props) {
  const location = useLocation()
  const mounted = React.useRef(false)
  React.useEffect(() => {
    mounted.current = true
  }, [])
  const fade = typeof document.startViewTransition !== 'function'
  // one key per top-level section: internal settings navigation
  // keeps the shell mounted — no flicker on back
  const key = location.pathname.startsWith('/settings') ? '/settings' : location.pathname
  return (
    <Box key={key} className={fade && mounted.current ? 'PageFade' : undefined} sx={{ height: 1 }}>
      {props.children}
    </Box>
  )
}
