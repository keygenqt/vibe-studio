/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'facts']
 */
import * as React from 'react'
import { useSelector } from 'react-redux'

import { Methods } from '../modules'

/**
 * The app block model: facts and the system theme; one fetch on mount.
 */
export function useCoreApp() {
  const version = useSelector(state => state.app.version)
  const isDebug = useSelector(state => state.app.isDebug)
  const systemTheme = useSelector(state => state.app.systemTheme)

  React.useEffect(() => {
    Methods.get_app_info()
  }, [])

  return { version, isDebug, systemTheme, ready: version !== null }
}
