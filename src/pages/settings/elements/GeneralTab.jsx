/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { useTranslation } from 'react-i18next'
import { Box, Typography } from '@mui/material'

// placeholder until general state exists
export function GeneralTab() {
  const { t } = useTranslation()
  return (
    <Box>
      <Typography variant="h6" color="text.secondary">
        {t('settings.t_general')}
      </Typography>
    </Box>
  )
}
