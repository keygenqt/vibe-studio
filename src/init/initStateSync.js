/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['init', 'states', 'i18n']
 */
import { listen } from '@tauri-apps/api/event'
import i18next from 'i18next'

import { setAll } from '../store/impl/appState'
import { Methods } from '../modules'

/**
 * Snapshot from Rust + listen state events. Called once at app start.
 * Single contract: one snapshot, one event type — full state every time.
 * Starts before React mounts, so no event-state is missed.
 * TAGS: ['states', 'i18n']
 */
export function initStateSync(store) {
  ;(async function () {
    try {
      const snapshot = await Methods.state_snapshot()
      store.dispatch(setAll(snapshot))
      await i18next.changeLanguage(snapshot.settings.locale)
    } catch (e) {
      console.error(e)
    }
    await listen('event-state', event => {
      store.dispatch(setAll(event.payload))
      const locale = event.payload.settings.locale
      if (i18next.language !== locale) {
        i18next.changeLanguage(locale)
      }
    })
  })()
}
