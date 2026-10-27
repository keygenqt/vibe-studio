/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { useTranslation } from 'react-i18next'
import Inbox from '@mui/icons-material/Inbox'
import { Stack, Typography } from '@mui/material'

export function EmptyState() {
  const { t } = useTranslation()
  return (
    <Stack height={1} spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <Inbox sx={{ fontSize: 56, color: 'text.secondary' }} />
      <Typography variant={'body1'} color={'text.primary'} textAlign={'center'}>
        {t('common.t_not_found')}
      </Typography>
    </Stack>
  )
}
