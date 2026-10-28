/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 */
import * as React from 'react'
import { useSelector } from 'react-redux'

import { Methods } from '../modules'

export function useCoreGroupsChat({ groupChatId } = {}) {
  const groupsChat = useSelector(state => state.groups_chat.groupsChat)
  const chats = useSelector(state => state.groups_chat.chats)
  const groupChat = useSelector(state =>
    groupChatId ? (state.groups_chat.groupChat[groupChatId] ?? null) : null
  )
  const providers = useSelector(state => state.providers.providers)
  const modelsByProvider = useSelector(state => state.providers.models)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    setError(null)
    Methods.get_groups_chat().catch(setError)
    Methods.get_chats().catch(setError)
    Methods.get_providers().catch(setError)
    if (groupChatId) Methods.get_group_chat(groupChatId).catch(setError)
  }, [groupChatId])

  // the model picker lists every model of every provider; the models
  // state is keyed by provider, readiness is each key present
  React.useEffect(() => {
    if (!providers) return
    providers.forEach(provider => Methods.get_provider_models(provider.id).catch(setError))
  }, [providers])

  // flat list for the picker: each model carries its provider
  const models = providers
    ? providers.flatMap(provider =>
        (modelsByProvider[provider.id] ?? []).map(model => ({ ...model, provider }))
      )
    : null

  return {
    groupsChat,
    chats,
    groupChat,
    providers,
    models,
    error,
    ready:
      error !== null ||
      (groupsChat !== null &&
        chats !== null &&
        providers !== null &&
        providers.every(provider => modelsByProvider[provider.id] !== undefined) &&
        (groupChatId ? groupChat !== null : true)),
  }
}
