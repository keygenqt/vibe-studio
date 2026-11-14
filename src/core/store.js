/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The Redux store mounting the block slices and the shared mutation envelope.
 */
import { configureStore } from '@reduxjs/toolkit'

import appReducer from './app/store'
import chatReducer from './chat/store'
import groupsChatReducer from './groups_chat/store'
import providersReducer from './providers/store'
import settingsReducer from './settings/store'
import workspaceReducer from './workspace/store'

const store = configureStore({
  reducer: {
    app: appReducer,
    chat: chatReducer,
    groups_chat: groupsChatReducer,
    providers: providersReducer,
    settings: settingsReducer,
    workspace: workspaceReducer,
  },
})

export default store

// the mutation envelope: the error lands in the block map and keeps throwing to the caller
export function runMutation(errors, key, action) {
  return action()
    .then(value => {
      store.dispatch(errors.errorsClean(key))
      return value
    })
    .catch(error => {
      store.dispatch(errors.errorsSet({ [key]: String(error) }))
      throw error
    })
}
