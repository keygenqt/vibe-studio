/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { useNavigate, useParams } from 'react-router'
import { Box, Stack, Typography } from '@mui/material'

import { ProviderForm } from './elements/ProviderForm'
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
  return (
    <Stack spacing={2}>
      <PageHeader
        title={isEdit ? `Provider #${providerId}` : 'New provider'}
        subtitle={
          isEdit
            ? 'Manage connection and available models.'
            : 'Connect a cloud API or a local runtime.'
        }
      />

      {isEdit ? (
        <ProviderForm
          name={provider.name}
          provider={provider.name}
          host={provider.url}
          apiKey={provider.key}
        />
      ) : (
        <ProviderForm />
      )}

      {isEdit && (
        <>
          <Typography variant={'h6'}>{'Models'}</Typography>
          {models.map(model => (
            <Box
              key={`model-${model.id}`}
              onClick={() => AppNav.open(navigate, AppRoutes.model(model.id))}
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                cursor: 'pointer',
                '&:hover': { opacity: 0.85 },
              }}
            >
              <Typography>{model.name}</Typography>
            </Box>
          ))}
        </>
      )}
    </Stack>
  )
}
