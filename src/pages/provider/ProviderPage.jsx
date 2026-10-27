/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack, Typography } from '@mui/material'
import SyncOutlined from '@mui/icons-material/SyncOutlined'

import { ProviderForm } from './elements/ProviderForm'
import { ModelCard } from './elements/ModelCard'
import { DashedButton } from '../../components/buttons'
import { PageHeader } from '../../components/views'
import { ErrorState, WaitState } from '../../components/states'
import { AppRoutes } from '../../constants'
import { AppNav } from '../../utils'
import { useCoreProviders } from '../../hooks'

export function ProviderPage() {
  const navigate = useNavigate()
  const { providerId } = useParams()
  const { t } = useTranslation()
  const isEdit = Boolean(providerId)
  const pid = Number(providerId)

  // the model resolves itself from the store — no local mirror
  const {
    catalog,
    providers,
    models,
    error: readError,
    ready,
  } = useCoreProviders(isEdit ? { providerId: pid } : {})
  const provider = isEdit ? ((providers ?? []).find(item => item.id === pid) ?? null) : null
  const [routeError, setRouteError] = React.useState(null)

  // an id with no row is a bad route, not an empty section
  React.useEffect(() => {
    if (isEdit && providers !== null && !provider) {
      setRouteError(new Error(t('error.t_text')))
    }
  }, [isEdit, providers, provider, t])

  const error = routeError ?? readError
  // a failed read or a bad route — the row cannot resolve
  if (error) {
    return (
      <WaitState ready={ready}>
        <ErrorState text={error.message ?? String(error)} />
      </WaitState>
    )
  }

  return (
    <WaitState ready={ready}>
      <Stack spacing={2}>
        <PageHeader
          title={
            isEdit
              ? (catalog.find(info => info.provider === provider?.provider)?.name ??
                t('provider.t_title'))
              : t('providers.t_add')
          }
          subtitle={t('provider.t_subtitle')}
        />

        {!isEdit || provider ? (
          <ProviderForm
            catalog={catalog}
            isEdit={isEdit}
            id={isEdit ? provider.id : 0}
            name={provider?.name}
            provider={provider?.provider}
            host={provider?.host}
            apiKey={provider?.api_key}
          />
        ) : null}

        {isEdit && provider && (
          <>
            <Typography variant={'h6'} color={'text.primary'}>
              {t('provider.t_models')}
            </Typography>
            <DashedButton
              icon={<SyncOutlined />}
              onClick={() => AppNav.open(navigate, AppRoutes.models(providerId))}
            >
              {t('provider.t_sync_models')}
            </DashedButton>
            {(models ?? []).map(model => (
              <ModelCard
                key={`model-${model.id}`}
                model={model}
                color={catalog.find(info => info.provider === provider.provider)?.color}
                onClick={() => AppNav.open(navigate, AppRoutes.model(model.id))}
              />
            ))}
          </>
        )}
      </Stack>
    </WaitState>
  )
}
