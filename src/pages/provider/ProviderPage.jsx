/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import { Stack, Typography } from '@mui/material'

import { ProviderForm } from './elements/ProviderForm'
import { ModelCard } from './elements/ModelCard'
import { DeleteDialog } from './elements/DeleteDialog'
import SyncOutlined from '@mui/icons-material/SyncOutlined'
import { DashedButton } from '../../components/buttons'
import { PageHeader } from '../../components/views'
import { AppRoutes } from '../../constants/AppRoutes'
import { AppNav } from '../../utils'

// draft: hardcoded until provider state lands in Rust
const provider = { id: 1, name: 'DeepSeek', url: 'https://api.deepseek.com/v1', key: 'sk-...' }
const models = [
  { id: 1, name: 'gpt-4o' },
  { id: 2, name: 'gpt-4o-mini' },
]

export function ProviderPage() {
  const navigate = useNavigate()
  const { providerId } = useParams()
  const isEdit = Boolean(providerId)
  // delete confirmation dialog
  const [openDelete, setOpenDelete] = React.useState(false)

  return (
    <Stack spacing={2}>
      <PageHeader
        title={isEdit ? provider.name : 'New provider'}
        subtitle={
          isEdit
            ? 'Manage connection and available models.'
            : 'Connect a cloud API or a local runtime.'
        }
      />

      {isEdit ? (
        <ProviderForm
          isEdit
          name={provider.name}
          provider={provider.name}
          host={provider.url}
          apiKey={provider.key}
          onDelete={() => setOpenDelete(true)}
        />
      ) : (
        <ProviderForm />
      )}

      {isEdit && (
        <>
          <Typography variant={'h6'}>{'Models'}</Typography>
          <DashedButton
            icon={<SyncOutlined />}
            onClick={() => AppNav.open(navigate, AppRoutes.models())}
          >
            {'Sync models'}
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
        title={'Delete provider?'}
        text={'The provider and its models will be removed. This action cannot be undone.'}
        onCancel={() => setOpenDelete(false)}
        onConfirm={() => {
          setOpenDelete(false)
          console.log('delete provider', provider.id)
        }}
      />
    </Stack>
  )
}
