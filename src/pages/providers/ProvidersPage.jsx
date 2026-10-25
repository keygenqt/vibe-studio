/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import * as React from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack } from '@mui/material'

import { ProviderCard } from './elements/ProviderCard'
import { DashedButton } from '../../components/buttons'
import { PageHeader } from '../../components/views'
import { WaitState } from '../../components/states'
import { AppRoutes } from '../../constants/AppRoutes'
import { AppNav } from '../../utils'
import { Methods } from '../../modules'

export function ProvidersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [providers, setProviders] = React.useState(Methods.providers_last())
  const [catalog, setCatalog] = React.useState(Methods.providers_catalog_last())

  React.useEffect(() => {
    Methods.providers_get().then(setProviders)
    Methods.providers_catalog().then(setCatalog)
  }, [])

  // kind id -> catalog entry, for card colors
  const catalogById = {}
  if (catalog) {
    catalog.forEach(info => {
      catalogById[info.provider] = info
    })
  }

  return (
    <WaitState ready={Boolean(providers) && Boolean(catalog)}>
      <Stack spacing={2}>
        <PageHeader title={t('settings.t_providers')} subtitle={t('providers.t_subtitle')} />
        <DashedButton onClick={() => AppNav.open(navigate, AppRoutes.providerAdd())}>
          {t('providers.t_add')}
        </DashedButton>
        {(providers ?? []).map(provider => (
          <ProviderCard
            key={`provider-${provider.id}`}
            provider={provider}
            color={catalogById[provider.provider]?.color}
            onConfigure={() => AppNav.open(navigate, AppRoutes.provider(provider.id))}
          />
        ))}
      </Stack>
    </WaitState>
  )
}
