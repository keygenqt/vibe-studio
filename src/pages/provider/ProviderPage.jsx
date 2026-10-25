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
import { WaitState } from '../../components/states'
import { AppRoutes } from '../../constants/AppRoutes'
import { AppNav } from '../../utils'
import { Methods } from '../../modules'

export function ProviderPage() {
  const navigate = useNavigate()
  const { providerId } = useParams()
  const { t } = useTranslation()
  const isEdit = Boolean(providerId)

  const [provider, setProvider] = React.useState(
    isEdit ? Methods.providers_last_by_id(Number(providerId)) : null
  )
  const [catalog, setCatalog] = React.useState(Methods.providers_catalog_last() ?? [])
  const [models, setModels] = React.useState(
    isEdit ? Methods.models_last_by_provider(Number(providerId)) : null
  )

  React.useEffect(() => {
    Methods.providers_catalog().then(setCatalog)
  }, [])

  React.useEffect(() => {
    if (!isEdit) {
      setProvider(null)
      setModels(null)
    } else {
      Methods.providers_get().then(list => {
        setProvider(list.find(item => item.id === Number(providerId)) ?? null)
      })
      // the models live in the store — every row is chosen for chat
      Methods.models_get(Number(providerId)).then(setModels)
    }
  }, [providerId])

  return (
    <WaitState ready={catalog.length > 0 && (!isEdit || Boolean(provider))}>
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
                color={Methods.providers_catalog_last_by(provider?.provider)?.color}
                onClick={() => AppNav.open(navigate, AppRoutes.model(model.id))}
              />
            ))}
          </>
        )}
      </Stack>
    </WaitState>
  )
}
