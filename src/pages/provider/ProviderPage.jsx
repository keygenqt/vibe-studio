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
import { DeleteDialog } from './elements/DeleteDialog'
import { DashedButton } from '../../components/buttons'
import { PageHeader } from '../../components/views'
import { AppRoutes } from '../../constants/AppRoutes'
import { AppNav } from '../../utils'
import { Methods } from '../../modules'

// draft: hardcoded until the model state lands in Rust
const models = [
  { id: 1, name: 'gpt-4o' },
  { id: 2, name: 'gpt-4o-mini' },
]

export function ProviderPage() {
  const navigate = useNavigate()
  const { providerId } = useParams()
  const { t } = useTranslation()
  const isEdit = Boolean(providerId)

  const [provider, setProvider] = React.useState(null)
  const [openDelete, setOpenDelete] = React.useState(false)

  React.useEffect(() => {
    if (!isEdit) {
      setProvider(null)
      return undefined
    }
    Methods.providers_get().then(list => {
      setProvider(list.find(item => item.id === Number(providerId)) ?? null)
    })
    return undefined
  }, [providerId])

  const onBack = () => AppNav.openWithReplace(navigate, AppRoutes.settingsProviders())

  const onSubmit = async values => {
    // wire format is snake_case, as the Rust struct expects
    await Methods.provider_save({
      id: isEdit ? provider.id : 0,
      name: values.name,
      provider: values.provider,
      host: values.host,
      api_key: values.apiKey,
    })
    onBack()
  }

  const onDelete = () => {
    Methods.provider_delete(provider.id).then(onBack)
  }

  return (
    <Stack spacing={2}>
      <PageHeader
        title={isEdit ? (provider?.name ?? t('settings.t_provider')) : t('settings.t_provider_add')}
        subtitle={t('settings.t_provider_subtitle')}
      />

      {!isEdit || provider ? (
        <ProviderForm
          isEdit={isEdit}
          name={provider?.name}
          provider={provider?.provider}
          host={provider?.host}
          apiKey={provider?.api_key}
          onDelete={isEdit ? () => setOpenDelete(true) : undefined}
          onSubmit={onSubmit}
        />
      ) : null}

      {isEdit && provider && (
        <>
          <Typography variant={'h6'}>{t('settings.t_models')}</Typography>
          <DashedButton
            icon={<SyncOutlined />}
            onClick={() => AppNav.open(navigate, AppRoutes.models())}
          >
            {t('settings.t_sync_models')}
          </DashedButton>
          {models.map(model => (
            <ModelCard
              key={`model-${model.id}`}
              name={model.name}
              onClick={() => AppNav.open(navigate, AppRoutes.model(model.id))}
            />
          ))}
        </>
      )}

      <DeleteDialog
        open={openDelete}
        title={t('settings.t_provider_delete_title')}
        text={t('settings.t_provider_delete_text')}
        onCancel={() => setOpenDelete(false)}
        onConfirm={onDelete}
      />
    </Stack>
  )
}
