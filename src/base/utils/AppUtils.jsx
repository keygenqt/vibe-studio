/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['misc']
 */
import { openUrl } from '@tauri-apps/plugin-opener'
import { flushSync } from 'react-dom'

export const AppUtils = {
  openUrl: async function (url) {
    if (window.isTauri) {
      await openUrl(url)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  },
  openPage: function (navigate, key, arg = {}) {
    document.startViewTransition(() => {
      flushSync(() => {
        navigate(key, arg)
      })
    })
  },
}
