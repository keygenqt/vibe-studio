/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Providers writes: mutations returning the fresh block state.
 */
import store from '../store'
import { ERRORS, errorsClean, errorsCleanAll, errorsSet } from './store'
import { ProvidersTauri } from './tauri'

// the shared envelope bound to the block error actions
const catchError = (key, action) => runMutation({ errorsSet, errorsClean }, key, action)

export const ProvidersMethod = {
  saveProvider: function (provider) {
    return catchError(ERRORS.saveProvider, () => {
      return ProvidersTauri.saveProvider(provider)
    })
  },
  deleteProvider: function (id) {
    return catchError(ERRORS.deleteProvider, () => ProvidersTauri.deleteProvider(id))
  },
  saveProviderModel: function (model, config) {
    return catchError(ERRORS.saveModel, () => ProvidersTauri.saveProviderModel(model, config))
  },
  saveProviderModels: function (providerId, checked) {
    return catchError(ERRORS.saveModels, () =>
      ProvidersTauri.saveProviderModels(providerId, checked)
    )
  },
  cleanError: function (key) {
    store.dispatch(key ? errorsClean(key) : errorsCleanAll())
  },
}
