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
  const history = useSelector(state => state.groups_chat.history)
  const groupChat = useSelector(state =>
    groupChatId ? (state.groups_chat.groupChat[groupChatId] ?? null) : null
  )
  const providers = useSelector(state => state.providers.providers)
  const allModels = useSelector(state => state.providers.models)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    setError(null)
    Methods.get_groups_chat().catch(setError)
    Methods.get_chats().catch(setError)
    Methods.get_group_chat_histories().catch(setError)
    Methods.get_providers().catch(setError)
    Methods.get_provider_models().catch(setError)
    if (groupChatId) Methods.get_group_chat(groupChatId).catch(setError)
  }, [groupChatId])

  // flat list for the picker: each model carries its provider —
  // the block state already holds every model of every provider
  const models =
    providers && allModels
      ? allModels
          .map(model => ({ ...model, provider: providers.find(p => p.id === model.provider_id) }))
          .filter(model => model.provider)
      : null

  return {
    groupsChat,
    chats,
    history,
    groupChat,
    providers,
    models,
    error,
    ready:
      error !== null ||
      (groupsChat !== null &&
        chats !== null &&
        history !== null &&
        providers !== null &&
        allModels !== null &&
        (groupChatId ? groupChat !== null : true)),
  }
}
