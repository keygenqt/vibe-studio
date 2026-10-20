/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import * as React from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { Box } from '@mui/material'

import { ErrorPage, MainPage, SettingsPage } from './pages'

export function AppRoute() {
  return (
    <BrowserRouter>
      <PageFade>
        <Routes>
          <Route index element={<MainPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </PageFade>
    </BrowserRouter>
  )
}

// remounts on every route change, so the fade-in plays each time
// the first mount (app start) renders without the fade
function PageFade(props) {
  const location = useLocation()
  const mounted = React.useRef(false)
  React.useEffect(() => {
    mounted.current = true
  }, [])
  return (
    <Box
      key={location.pathname}
      className={mounted.current ? 'PageFade' : undefined}
      sx={{ height: 1 }}
    >
      {props.children}
    </Box>
  )
}
