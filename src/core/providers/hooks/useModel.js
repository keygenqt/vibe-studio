/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Model read: the routed model row load and the copy for render.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, errorsSet, modelSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useModel(id) {
  // the copy read: the row paints for the routed model only
  const model = useSelector(s => s.providers.model[id] ?? null)
  const errors = useSelector(s => s.providers.errors)

  // the mount load: the routed model row
  useEffectSingle({
    keys: [id],
    enabled: Boolean(id) && !model,
    callback: () =>
      ProvidersTauri.getProviderModel(id)
        .then(value => store.dispatch(modelSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.model]: String(error) }))),
  })

  return {
    model,
    errors,
    ready: id ? model !== null : true,
  }
}
