/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The Redux store mounting the block slices.
 */
import { configureStore } from '@reduxjs/toolkit'

import appReducer from './app/store'
import uiReducer from './ui/store'
import chatReducer from './chat/store'
import groupsChatReducer from './groupsChat/store'
import providersReducer from './providers/store'
import settingsReducer from './settings/store'
import workspaceReducer from './workspace/store'

const store = configureStore({
  reducer: {
    app: appReducer,
    ui: uiReducer,
    chat: chatReducer,
    groupsChat: groupsChatReducer,
    providers: providersReducer,
    settings: settingsReducer,
    workspace: workspaceReducer,
  },
})

export default store
