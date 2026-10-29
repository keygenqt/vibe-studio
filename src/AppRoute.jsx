/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import * as React from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router'
import { Box } from '@mui/material'

import { AppRoutes } from './constants'
import {
  ChatEmptyPage,
  ChatPage,
  ErrorPage,
  GeneralPage,
  GroupChatPage,
  GroupsChatPage,
  MainPage,
  ModelPage,
  ModelsPage,
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
      {
        path: AppRoutes.main(),
        element: <MainPage />,
        children: [
          { index: true, element: <ChatEmptyPage /> },
          { path: AppRoutes.chat(), element: <ChatPage /> },
        ],
      },
      {
        path: AppRoutes.settings(),
        element: <SettingsPage />,
        children: [
          {
            index: true,
            element: <Navigate replace to={AppRoutes.settingsGeneral()} />,
          },
          { path: AppRoutes.settingsGeneral(), element: <GeneralPage /> },
          { path: AppRoutes.settingsProviders(), element: <ProvidersPage /> },
          { path: AppRoutes.providerAdd(), element: <ProviderPage /> },
          { path: AppRoutes.provider(), element: <ProviderPage /> },
          { path: AppRoutes.model(), element: <ModelPage /> },
          { path: AppRoutes.models(), element: <ModelsPage /> },
          { path: AppRoutes.settingsGroupsChat(), element: <GroupsChatPage /> },
          { path: AppRoutes.groupChatAdd(), element: <GroupChatPage /> },
          { path: AppRoutes.groupChat(), element: <GroupChatPage /> },
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
  // one key per top-level section: navigation inside a section
  // (settings, chats) keeps the shell mounted — no flicker on back
  const key = '/' + (location.pathname.split('/')[1] ?? '')
  return (
    <Box key={key} className={fade && mounted.current ? 'PageFade' : undefined} sx={{ height: 1 }}>
      {props.children}
    </Box>
  )
}
