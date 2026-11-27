/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The styled fallback the router renders when a route throws.
 */
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteError } from 'react-router'
import { Box, Stack, Typography } from '@mui/material'

import { BaseLayout } from '../../layouts'
import { BackIconButton } from '../components/buttons'

export function ErrorRoutePage() {
  const { t } = useTranslation()
  const error = useRouteError()
  // the stack stays in the console: the screen speaks human
  React.useEffect(() => console.error(error), [error])

  return (
    <BaseLayout railActions={<BackIconButton />}>
      <Box
        height={1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Stack spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant={'body1'} color={'text.secondary'}>
            {t('error.t_crash')}
          </Typography>
          {/* the thrown internals: dev eyes only */}
          {import.meta.env.DEV && (
            <Typography variant={'body2'} color={'text.secondary'} sx={{ fontFamily: 'monospace' }}>
              {String(error)}
            </Typography>
          )}
        </Stack>
      </Box>
    </BaseLayout>
  )
}
