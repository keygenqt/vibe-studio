/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['facts']
 * INFO: Page paths: the route pattern bare, the concrete URL with an id.
 */

// Single source of page routes. Call without arguments for the route
// pattern, with an id for a concrete URL.
export const AppRoutes = {
  main: () => '/',
  chat: (chatId = ':chatId') => `/chat/${chatId}`,
  settings: () => '/settings',
  settingsGeneral: () => '/settings/general',
  settingsProviders: () => '/settings/providers',
  providerAdd: () => '/settings/provider/add',
  provider: (providerId = ':providerId') => `/settings/provider/${providerId}`,
  model: (modelId = ':modelId') => `/settings/model/${modelId}`,
  models: (providerId = ':providerId') => `/settings/models/${providerId}`,
  settingsGroupsChat: () => '/settings/groups-chat',
  groupChatAdd: () => '/settings/group-chat/add',
  groupChat: (groupChatId = ':groupChatId') => `/settings/group-chat/${groupChatId}`,
}
