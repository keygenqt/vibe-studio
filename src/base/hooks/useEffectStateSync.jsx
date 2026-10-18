/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states', 'i18n']
 */
import { useDispatch } from 'react-redux'
import { listen } from '@tauri-apps/api/event'
import i18next from 'i18next'

import { setAll } from '../../store/impl/appState'
import { Methods } from '../../modules'
import { useEffectSingle } from './useEffectSingle'

/**
 * Snapshot from Rust + listen state events. One call at app start.
 * Single contract: one snapshot, one event type — full state every time.
 */
export function useEffectStateSync() {
  const dispatch = useDispatch()
  useEffectSingle(() => {
    ;(async function () {
      try {
        const snapshot = await Methods.state_snapshot()
        dispatch(setAll(snapshot))
        await i18next.changeLanguage(snapshot.settings.locale)
      } catch (e) {
        console.error(e)
      }
      await listen('event-state', event => {
        dispatch(setAll(event.payload))
        const locale = event.payload.settings.locale
        if (i18next.language !== locale) {
          i18next.changeLanguage(locale)
        }
      })
    })()
  })
}
