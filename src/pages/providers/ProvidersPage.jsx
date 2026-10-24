/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack } from '@mui/material'

import { ProviderCard } from './elements/ProviderCard'
import { DashedButton } from '../../components/buttons'
import { PageHeader } from '../../components/views'
import { AppRoutes } from '../../constants/AppRoutes'
import { AppNav } from '../../utils'

// draft: hardcoded until provider state lands in Rust
const providers = [
  { id: 1, name: 'DeepSeek', provider: 'DeepSeek', host: 'api.deepseek.com' },
  { id: 2, name: 'Ollama', provider: 'Ollama', host: 'localhost:11434' },
  { id: 3, name: 'Qwen', provider: 'Qwen', host: 'dashscope-intl.aliyuncs.com/compatible-mode/v1' },
  { id: 4, name: 'Kimi', provider: 'Moonshot', host: 'api.moonshot.cn/v1' },
  { id: 5, name: 'Zhipu', provider: 'Zhipu', host: 'open.bigmodel.cn/api/paas/v4' },
]

export function ProvidersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <Stack spacing={2}>
      <PageHeader title={t('settings.t_providers')} subtitle={t('settings.t_providers_subtitle')} />
      <DashedButton onClick={() => AppNav.open(navigate, AppRoutes.providerAdd())}>
        {t('settings.t_provider_add')}
      </DashedButton>
      {providers.map(provider => (
        <ProviderCard
          key={`provider-${provider.id}`}
          provider={provider}
          onConfigure={() => AppNav.open(navigate, AppRoutes.provider(provider.id))}
        />
      ))}
    </Stack>
  )
}
