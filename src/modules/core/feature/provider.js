/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { invoke } from '@tauri-apps/api/core'

export const provider = {
  // catalog: supported provider types for the add form
  providers_catalog: async function () {
    return invoke('providers_catalog', {})
  },
  providers_get: async function () {
    return invoke('providers_get', {})
  },
  // insert on id = 0, update otherwise; returns the stored row
  provider_save: async function (provider) {
    return invoke('provider_save', { provider })
  },
  provider_delete: async function (id) {
    return invoke('provider_delete', { id })
  },
}
