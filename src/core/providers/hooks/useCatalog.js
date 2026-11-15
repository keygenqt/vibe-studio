/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Catalog read: the provider kinds load and the copy for the forms.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, catalogSet, errorsSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useCatalog() {
  // the copy read: the provider kinds catalog
  const catalog = useSelector(s => s.providers.catalog)
  const errors = useSelector(s => s.providers.errors)

  // the mount load: the provider kinds catalog
  useEffectSingle({
    enabled: catalog === null,
    callback: () =>
      ProvidersTauri.getProvidersCatalog()
        .then(value => store.dispatch(catalogSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.catalog]: String(error) }))),
  })

  return {
    catalog,
    errors,
    ready: catalog !== null,
  }
}
