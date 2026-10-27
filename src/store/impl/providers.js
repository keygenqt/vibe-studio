/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { createSlice } from '@reduxjs/toolkit'

// Render copies of the Rust providers block answers (providers and
// their models). Every read and every mutation lands its answer here;
// `null`/`{}` = the read has not happened yet.
const providersSlice = createSlice({
  name: 'providers',
  initialState: {
    catalog: null, // supported provider kinds
    providers: null, // configured providers
    models: {}, // models by provider id
    model: {}, // single model rows by id
  },
  reducers: {
    catalogSet: (state, action) => {
      state.catalog = action.payload
    },
    providersSet: (state, action) => {
      state.providers = action.payload
    },
    modelsSet: (state, action) => {
      state.models[action.payload.providerId] = action.payload.models
    },
    modelSet: (state, action) => {
      state.model[action.payload.id] = action.payload
    },
  },
})

export const { catalogSet, providersSet, modelsSet, modelSet } = providersSlice.actions
export default providersSlice.reducer
