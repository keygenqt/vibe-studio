/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 * INFO: Provider add/edit page with its model list.
 */
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack, Typography } from '@mui/material'
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined'
import SyncOutlined from '@mui/icons-material/SyncOutlined'

import { ProviderForm } from './elements/ProviderForm'
import { DashedButton } from '../../components/buttons'
import { ModelCard, PageHeader } from '../../components/views'
import { OutletLayout } from '../../components/layouts'
import { AppRoutes } from '../../constants'
import { AppNav } from '../../utils'
import { useCatalog, useModels, useProvider } from '../../core'

export function ProviderPage() {
  const navigate = useNavigate()
  const { providerId } = useParams()
  const { t } = useTranslation()
  const isEdit = Boolean(providerId)
  const pid = Number(providerId)
  const { catalog, ready: catalogReady, error: catalogError } = useCatalog()
  const {
    provider,
    ready: providerReady,
    error: providerError,
  } = useProvider(isEdit ? pid : undefined)
  const { models, ready: modelsReady, error: modelsError } = useModels(isEdit ? pid : undefined)

  // any resource failed: the error paints over the loader
  const failure = catalogError ?? providerError ?? modelsError
  const ready = catalogReady && providerReady && modelsReady

  return (
    <OutletLayout ready={ready} error={failure}>
      <Stack spacing={2}>
        <PageHeader
          title={
            isEdit
              ? ((catalog ?? []).find(info => info.provider === provider?.provider)?.name ??
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
            apiKey={provider?.apiKey}
            project={provider?.project}
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
                title={model.displayName ? `${model.displayName} (${model.name})` : model.name}
                description={model.params}
                capabilities={model.capabilities ?? undefined}
                context={model.contextLength ?? undefined}
                color={(catalog ?? []).find(info => info.provider === provider.provider)?.color}
                onClick={() => AppNav.open(navigate, AppRoutes.model(model.id))}
                action={<ChevronRightOutlined color={'action'} />}
              />
            ))}
          </>
        )}
      </Stack>
    </OutletLayout>
  )
}
