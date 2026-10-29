/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { createSlice } from '@reduxjs/toolkit'

const providersSlice = createSlice({
  name: 'providers',
  initialState: {
    catalog: null,
    providers: null,
    provider: {},
    models: [],
    model: {},
  },
  reducers: {
    catalogSet: (state, action) => {
      state.catalog = action.payload
    },
    providersSet: (state, action) => {
      state.providers = action.payload
    },
    providerSet: (state, action) => {
      state.provider[action.payload.id] = action.payload
    },
    modelsSet: (state, action) => {
      state.models = action.payload
    },
    modelSet: (state, action) => {
      state.model[action.payload.id] = action.payload
    },
  },
})

export const { catalogSet, providersSet, providerSet, modelsSet, modelSet } = providersSlice.actions
export default providersSlice.reducer
