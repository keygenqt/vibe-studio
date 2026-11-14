/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The public core surface and the Rust event binding.
 */
import { appEvents } from './app/events'
import { chatEvents } from './chat/events'
import { groupsChatEvents } from './groups_chat/events'
import { providersEvents } from './providers/events'
import { settingsEvents } from './settings/events'
import { workspaceEvents } from './workspace/events'

export { default as store } from './store'
export { AppMethod } from './app/method'
export { useApp } from './app/useApp'
export { ChatMethod } from './chat/method'
export { useChat } from './chat/useChat'
export { GroupsChatMethod } from './groups_chat/method'
export { useGroupsChat } from './groups_chat/useGroupsChat'
export { ProvidersMethod } from './providers/method'
export { useProviders } from './providers/useProviders'
export { useProviderModelsByType } from './providers/useProviderModelsByType'
export { SettingsMethod } from './settings/method'
export { useSettings } from './settings/useSettings'
export { WorkspaceMethod } from './workspace/method'
export { useWorkspace } from './workspace/useWorkspace'

// one call for the app lifetime; each block contributes its own channels
export function bindEvents() {
  return Promise.all([
    ...appEvents(),
    ...chatEvents(),
    ...providersEvents(),
    ...groupsChatEvents(),
    ...settingsEvents(),
    ...workspaceEvents(),
  ])
}
