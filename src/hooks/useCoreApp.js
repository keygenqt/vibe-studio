/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'facts']
 * INFO: App facts for render: version, debug flag, OS theme copy.
 */
import * as React from 'react'
import { useSelector } from 'react-redux'

import { Methods } from '../modules'

export function useCoreApp() {
  const version = useSelector(state => state.app.version)
  const isDebug = useSelector(state => state.app.isDebug)
  const systemTheme = useSelector(state => state.app.systemTheme)

  React.useEffect(() => {
    Methods.get_app_info()
    Methods.get_system_theme()
  }, [])

  return { version, isDebug, systemTheme, ready: version !== null }
}
