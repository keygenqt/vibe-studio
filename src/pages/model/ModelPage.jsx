/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import * as React from 'react'
import { useParams } from 'react-router'
import { Stack } from '@mui/material'

import { PageHeader } from '../../components/views'
import { ErrorState, WaitState } from '../../components/states'
import { AppUtils } from '../../utils'
import { Methods } from '../../modules'

import { ModelForm } from './elements/ModelForm'

export function ModelPage() {
  const { modelId } = useParams()
  const id = Number(modelId)
  const [model, setModel] = React.useState(Methods.model_last_by_id(id))
  const [provider, setProvider] = React.useState(null)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    let live = true
    Methods.model_get(id)
      .then(row => {
        if (!live) return
        setModel(row)
        // the provider row feeds the subtitle: name and host
        Methods.providers_get().then(list => {
          if (!live) return
          setProvider(list.find(item => item.id === row.provider_id) ?? null)
        })
      })
      .catch(err => {
        if (live) setError(err)
      })
    return () => {
      live = false
    }
  }, [modelId])

  // readiness: loaded or failed — the loader never covers an error
  const ready = error !== null || model !== null

  return (
    <WaitState ready={ready}>
      {error ? (
        <ErrorState text={error.message ?? String(error)} />
      ) : (
        model && (
          <Stack spacing={2}>
            <PageHeader
              title={model.name}
              subtitle={provider ? `${provider.name} · ${provider.host} · ${model.name}` : ''}
            />
            <ModelForm key={`model-${id}`} model={model} onSaved={setModel} />
          </Stack>
        )
      )}
    </WaitState>
  )
}
