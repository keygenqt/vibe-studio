/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks']
 * INFO: The maximized state of the Tauri window.
 */
import { useEffect, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'

export function useWindowMaximized() {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    const appWindow = getCurrentWindow()
    let disposed = false
    // maximize and restore resize the window: the state rides the resize events
    const sync = () =>
      appWindow
        .isMaximized()
        .then(value => {
          if (!disposed) setMaximized(value)
        })
        .catch(console.error)
    sync()
    const unlisten = appWindow.onResized(() => sync())
    return () => {
      disposed = true
      unlisten.then(fn => fn()).catch(console.error)
    }
  }, [])

  return maximized
}
