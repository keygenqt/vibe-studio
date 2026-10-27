/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks']
 */
import * as React from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

export function useEffectFocus() {
  const [isFocusWindow, setIsFocusWindow] = React.useState(true)

  React.useEffect(() => {
    const unlisten = getCurrentWindow().onFocusChanged(({ payload: focused }) => {
      setIsFocusWindow(focused)
    })
    return () => {
      unlisten.then(fn => fn())
    }
  }, [])

  return isFocusWindow
}
