/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: The providers block copy: catalog, providers, models.
 */
import { createSlice } from '@reduxjs/toolkit'

export const ERRORS = {
  catalog: 'catalog',
  providers: 'providers',
  model: 'model',
  models: 'models',
  defaults: 'defaults',
  saveProvider: 'saveProvider',
  deleteProvider: 'deleteProvider',
  saveModel: 'saveModel',
  saveModels: 'saveModels',
}

const providersSlice = createSlice({
  name: 'providers',
  initialState: {
    catalog: null,
    providers: null,
    provider: {},
    models: null,
    model: {},
    defaults: null,
    errors: {},
  },
  reducers: {
    errorsSet: (state, action) => {
      state.errors = { ...state.errors, ...action.payload }
    },
    errorsClean: (state, action) => {
      delete state.errors[action.payload]
    },
    errorsCleanAll: state => {
      state.errors = {}
    },
    providersStateSet: (state, action) => {
      state.catalog = action.payload.catalog
      state.providers = action.payload.providers
      state.models = action.payload.models
      state.provider = {}
      state.model = {}
    },
    modelDefaultsSet: (state, action) => {
      state.defaults = action.payload
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

export const {
  errorsSet,
  errorsClean,
  errorsCleanAll,
  providersStateSet,
  modelDefaultsSet,
  catalogSet,
  providersSet,
  providerSet,
  modelsSet,
  modelSet,
} = providersSlice.actions
export default providersSlice.reducer
