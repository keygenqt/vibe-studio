/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Catalog read: the provider kinds load and the copy for the forms.
 */
import { useState } from 'react'
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { catalogSet } from '../store'
import { ProvidersTauri } from '../tauri'

export function useCatalog() {
  const catalog = useSelector(s => s.providers.catalog)
  const [error, setError] = useState(null)

  useEffectSingle({
    enabled: catalog === null,
    callback: async () => {
      setError(null)
      try {
        const value = await ProvidersTauri.getProvidersCatalog()
        store.dispatch(catalogSet(value))
      } catch (err) {
        setError(String(err))
      }
    },
  })

  return {
    catalog,
    error,
    ready: catalog !== null,
  }
}
