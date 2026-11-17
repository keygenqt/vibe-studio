/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The groups chat event: the fresh block state lands in the copy.
 */
import store from '../store'
import { groupsChatStateSet } from './store'
import { GroupsChatTauri } from './tauri'

export function groupsChatEvents() {
  return [GroupsChatTauri.onState(state => store.dispatch(groupsChatStateSet(state)))]
}
