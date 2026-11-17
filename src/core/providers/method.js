/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Providers writes: the Tauri commands; the fresh state lands through the block event.
 */
import { ProvidersTauri } from './tauri'

export const ProvidersMethod = {
  saveProvider: function (provider) {
    return ProvidersTauri.saveProvider(provider)
  },
  deleteProvider: function (id) {
    return ProvidersTauri.deleteProvider(id)
  },
  saveProviderModel: function (model, config) {
    return ProvidersTauri.saveProviderModel(model, config)
  },
  saveProviderModels: function (providerId, checked) {
    return ProvidersTauri.saveProviderModels(providerId, checked)
  },
}
