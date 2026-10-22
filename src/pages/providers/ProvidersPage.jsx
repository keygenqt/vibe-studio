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

// draft: hardcoded until provider state lands in Rust
const providers = [
  { id: 1, name: 'DeepSeek', host: 'api.deepseek.com', isLocal: false },
  { id: 2, name: 'Ollama', host: 'localhost:11434', isLocal: true },
  { id: 3, name: 'Qwen', host: 'dashscope-intl.aliyuncs.com/compatible-mode/v1', isLocal: false },
  { id: 4, name: 'Moonshot', host: 'api.moonshot.cn/v1', isLocal: false },
  { id: 5, name: 'Zhipu', host: 'open.bigmodel.cn/api/paas/v4', isLocal: false },
]

export function ProvidersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <Stack spacing={2}>
      <PageHeader title={t('settings.t_providers')} subtitle={t('settings.t_providers_subtitle')} />
      <DashedButton onClick={() => navigate('/settings/provider/add')}>
        {t('settings.t_provider_add')}
      </DashedButton>
      {providers.map(provider => (
        <ProviderCard
          key={`provider-${provider.id}`}
          provider={provider}
          onConfigure={() => navigate(`/settings/provider/${provider.id}`)}
        />
      ))}
    </Stack>
  )
}
