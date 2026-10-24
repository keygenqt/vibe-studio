/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { createSlice } from '@reduxjs/toolkit'

// Pure UI state only. Application state lives in Rust — the
// WorkspaceProvider mirrors it, this store never holds a copy.
export const appStateSlice = createSlice({
  name: 'appState',
  initialState: {},
  reducers: {},
})

export default appStateSlice.reducer
