/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Models read: the collection load, the copy and the optional provider filter.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, errorsSet, modelsSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useModels(providerId) {
  // the copy read: the whole model table, the provider slice filters on render
  const models = useSelector(s => s.providers.models)
  const errors = useSelector(s => s.providers.errors)

  // the mount load: the whole model table
  useEffectSingle({
    enabled: models === null,
    callback: () =>
      ProvidersTauri.getProviderModels(null)
        .then(value => store.dispatch(modelsSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.models]: String(error) }))),
  })

  const providerModels = providerId
    ? models
      ? models.filter(model => model.provider_id === providerId)
      : null
    : models

  return {
    models: providerModels,
    errors,
    ready: models !== null,
  }
}
