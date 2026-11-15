/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Providers read: the collection load and the copy for render.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, errorsSet, providersSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useProviders() {
  // the copy read: the providers collection
  const providers = useSelector(s => s.providers.providers)
  const errors = useSelector(s => s.providers.errors)

  // the mount load: the providers collection
  useEffectSingle({
    enabled: providers === null,
    callback: () =>
      ProvidersTauri.getProviders()
        .then(value => store.dispatch(providersSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.providers]: String(error) }))),
  })

  return {
    providers,
    errors,
    ready: providers !== null,
  }
}
