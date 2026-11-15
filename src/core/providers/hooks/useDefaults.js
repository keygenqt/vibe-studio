/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Defaults read: the model parameter spec, loaded when both rows are known.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, errorsSet, modelDefaultsSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useDefaults(model, provider) {
  // the copy read: the parameter spec of the routed model
  const defaults = useSelector(s => s.providers.defaults)
  const errors = useSelector(s => s.providers.errors)

  // the mount load: both rows must be known — the call never fires
  // with a broken argument while the collections are still loading
  useEffectSingle({
    keys: [model?.id, provider?.id],
    enabled: Boolean(model) && Boolean(provider),
    callback: () =>
      ProvidersTauri.getModelDefaults(provider, model.name)
        .then(value => store.dispatch(modelDefaultsSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.defaults]: String(error) }))),
  })

  return {
    defaults,
    errors,
    ready: !model || !provider ? true : defaults !== null,
  }
}
