/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { configureStore } from '@reduxjs/toolkit'

import appReducer from './impl/app'
import providersReducer from './impl/providers'
import workspaceReducer from './impl/workspace'

export default configureStore({
  reducer: {
    app: appReducer,
    providers: providersReducer,
    workspace: workspaceReducer,
  },
})
