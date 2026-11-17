/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The providers block copy: catalog, collections and routed rows.
 */
import { createSlice } from '@reduxjs/toolkit'

const providersSlice = createSlice({
  name: 'providers',
  initialState: {
    catalog: null,
    providers: null,
    provider: {},
    models: null,
    model: {},
  },
  reducers: {
    providersStateSet: (state, action) => {
      Object.assign(state, action.payload)
      state.provider = {}
      state.model = {}
    },
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

export const { providersStateSet, catalogSet, providersSet, providerSet, modelsSet, modelSet } =
  providersSlice.actions
export default providersSlice.reducer
