/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The chat event: the fresh snapshot lands in the copy.
 */
import store from '../store'
import { chatStateSet } from './store'
import { ChatTauri } from './tauri'

export function chatEvents() {
  return [ChatTauri.onState(state => store.dispatch(chatStateSet(state)))]
}
