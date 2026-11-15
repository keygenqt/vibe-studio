/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Provider read: the routed provider row load and the copy for render.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, errorsSet, providerSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useProvider(id) {
  // the copy read: the row paints for the routed provider only
  const provider = useSelector(s => s.providers.provider[id] ?? null)
  const errors = useSelector(s => s.providers.errors)

  // the mount load: the routed provider row
  useEffectSingle({
    keys: [id],
    enabled: Boolean(id) && !provider,
    callback: () =>
      ProvidersTauri.getProvider(id)
        .then(value => store.dispatch(providerSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.provider]: String(error) }))),
  })

  return {
    provider,
    errors,
    ready: id ? provider !== null : true,
  }
}
