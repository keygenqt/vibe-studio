/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { useTranslation } from 'react-i18next'
import { Box, Typography } from '@mui/material'

import { ShellLayout } from '../../components/layouts'
import { BackIconButton } from '../../components/buttons'

export function ErrorPage() {
  const { t } = useTranslation()
  return (
    <ShellLayout railActions={<BackIconButton />}>
      <Box
        height={1}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}
      >
        <Typography variant={'body1'} color={'text.secondary'}>
          {t('error.t_text')}
        </Typography>
      </Box>
    </ShellLayout>
  )
}
