/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack, Typography } from '@mui/material'
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined'
import SyncOutlined from '@mui/icons-material/SyncOutlined'

import { ProviderForm } from './elements/ProviderForm'
import { DashedButton } from '../../components/buttons'
import { ModelCard, PageHeader } from '../../components/views'
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
  const {
    catalog,
    provider,
    models,
    error: readError,
    ready,
  } = useCoreProviders(isEdit ? { providerId: pid } : {})

  const error = readError
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
                title={model.display_name ? `${model.display_name} (${model.name})` : model.name}
                description={model.params}
                vision={model.vision}
                thinking={model.reasoning}
                tools={model.tools}
                color={catalog.find(info => info.provider === provider.provider)?.color}
                onClick={() => AppNav.open(navigate, AppRoutes.model(model.id))}
                action={<ChevronRightOutlined color={'action'} />}
              />
            ))}
          </>
        )}
      </Stack>
    </WaitState>
  )
}
