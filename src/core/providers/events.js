/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The providers event: the fresh block state lands in the copy.
 */
import store from '../store'
import { providersStateSet } from './store'
import { ProvidersTauri } from './tauri'

export function providersEvents() {
  return [ProvidersTauri.onState(state => store.dispatch(providersStateSet(state)))]
}
