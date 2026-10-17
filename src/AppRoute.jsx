/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { BrowserRouter, Route, Routes } from 'react-router'

import { ActionBack, RailView } from './base'
import { AppBarLayout, ShellLayout, SidebarLayout } from './layouts'
import { ErrorPage, MainPage } from './pages'
// @todo
import { SidebarView } from './pages/main/elements/sidebar/SidebarView'

export function AppRoute() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          index
          element={
            <AppBarLayout>
              <MainPage />
            </AppBarLayout>
          }
        />
        <Route
          path="*"
          element={
            <AppBarLayout actions={<ActionBack />}>
              <ErrorPage />
            </AppBarLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
