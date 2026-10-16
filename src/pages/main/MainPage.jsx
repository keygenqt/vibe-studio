/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Stack, Typography } from '@mui/material'

import { AppData } from '../../constants/AppData'
import { useEffectSingle } from '../../base'
import { BaseLayout } from '../../layouts'
import { Methods } from '../../modules'

export function MainPage() {
  const { t } = useTranslation()
  const [info, setInfo] = React.useState(null)

  useEffectSingle(async () => {
    try {
      setInfo(await Methods.app_info())
    } catch (e) {
      console.error(e)
    }
  })

  return (
    <BaseLayout>
      <Stack height={1} spacing={3} sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Box
          component="img"
          src={AppData.images.app_icon}
          alt="Vibe Studio"
          sx={{ width: 96, height: 96 }}
        />
        <Typography variant="h5" sx={{ color: 'text.primary' }}>
          Vibe Studio
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {info ? `v${info.version}${info.is_debug ? ' · dev' : ''}` : t('common.t_loading')}
        </Typography>
      </Stack>
    </BaseLayout>
  )
}
