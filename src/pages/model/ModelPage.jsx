/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import { useParams } from 'react-router'
import { Stack } from '@mui/material'

import { PageHeader } from '../../components/views'
import { ErrorState, WaitState } from '../../components/states'
import { useCoreProviders } from '../../hooks'

import { ModelForm } from './elements/ModelForm'

export function ModelPage() {
  const { modelId } = useParams()
  const id = Number(modelId)
  const { providers, model, error, ready } = useCoreProviders({ modelId: id })
  const provider = (providers ?? []).find(item => item.id === model?.provider_id) ?? null

  if (error) {
    return (
      <WaitState ready={ready}>
        <ErrorState text={error.message ?? String(error)} />
      </WaitState>
    )
  }

  return (
    <WaitState ready={ready}>
      {model && (
        <Stack spacing={2}>
          <PageHeader
            title={model.name}
            subtitle={provider ? `${provider.name} · ${provider.host}` : ''}
          />
          <ModelForm key={`model-${id}`} model={model} />
        </Stack>
      )}
    </WaitState>
  )
}
