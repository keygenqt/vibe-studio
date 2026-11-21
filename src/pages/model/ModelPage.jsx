/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Model settings page over the providers block.
 */
import { useParams } from 'react-router'
import { Stack } from '@mui/material'

import { PageHeader } from '../../components/views'
import { OutletLayout } from '../../components/layouts'
import { useDefaults, useModel, useProviders } from '../../core'

import { ModelForm } from './elements/ModelForm'

export function ModelPage() {
  const { modelId } = useParams()
  const id = Number(modelId)
  const { model, ready: modelReady, error: modelError } = useModel(id)
  const { providers } = useProviders()
  const provider = (providers ?? []).find(item => item.id === model?.providerId) ?? null
  // the parameter spec of the routed model; the query hook owns the fetch
  const { defaults, error: defaultsError } = useDefaults(model, provider)

  // the spec failed: the form would run without bounds — the error paints instead
  const failure = modelError ?? defaultsError

  return (
    <OutletLayout ready={modelReady} error={failure}>
      {model && (
        <Stack spacing={2}>
          <PageHeader
            title={model.name}
            subtitle={provider ? `${provider.name} · ${provider.host}` : ''}
          />
          <ModelForm
            key={`model-${id}`}
            model={model}
            defaults={defaults}
            kind={provider?.provider ?? null}
          />
        </Stack>
      )}
    </OutletLayout>
  )
}
