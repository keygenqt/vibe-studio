/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack } from '@mui/material'

import { ProviderCard } from './elements/ProviderCard'
import { DashedButton } from '../../components/buttons'
import { PageHeader } from '../../components/views'
import { WaitState } from '../../components/states'
import { AppRoutes } from '../../constants'
import { AppNav } from '../../utils'
import { useCoreProviders } from '../../hooks'

export function ProvidersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { catalog, providers, ready } = useCoreProviders()

  return (
    <WaitState ready={ready}>
      <Stack spacing={2}>
        <PageHeader title={t('settings.t_providers')} subtitle={t('providers.t_subtitle')} />
        <DashedButton onClick={() => AppNav.open(navigate, AppRoutes.providerAdd())}>
          {t('providers.t_add')}
        </DashedButton>
        {(providers ?? []).map(provider => (
          <ProviderCard
            key={`provider-${provider.id}`}
            provider={provider}
            color={catalog.find(info => info.provider === provider.provider)?.color}
            onConfigure={() => AppNav.open(navigate, AppRoutes.provider(provider.id))}
          />
        ))}
      </Stack>
    </WaitState>
  )
}
