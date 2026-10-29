/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { configureStore } from '@reduxjs/toolkit'

import appReducer from './impl/app'
import chatReducer from './impl/chat'
import groupsChatReducer from './impl/groups_chat'
import providersReducer from './impl/providers'
import workspaceReducer from './impl/workspace'

export default configureStore({
  reducer: {
    app: appReducer,
    chat: chatReducer,
    groups_chat: groupsChatReducer,
    providers: providersReducer,
    workspace: workspaceReducer,
  },
})
