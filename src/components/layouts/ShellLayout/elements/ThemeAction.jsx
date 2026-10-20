/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'theme']
 */
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip } from '@mui/material'
import DarkMode from '@mui/icons-material/DarkMode'
import DesktopWindows from '@mui/icons-material/DesktopWindows'
import LightMode from '@mui/icons-material/LightMode'

import { Methods } from '../../../../modules'

export function ThemeAction() {
  const { t } = useTranslation()
  const themeOverride = useSelector(state => state.appState.settings.theme)

  const cycleTheme = () => {
    const next = themeOverride === 'light' ? 'dark' : themeOverride === 'dark' ? 'system' : 'light'
    Methods.settings_set_theme(next)
  }

  return (
    <Tooltip title={t('main.t_theme')}>
      <IconButton
        onClick={cycleTheme}
        size="small"
        color="primary"
        sx={{
          p: '2px',
        }}
      >
        {themeOverride === 'light' ? (
          <LightMode color="primary" sx={{ fontSize: 16 }} />
        ) : themeOverride === 'dark' ? (
          <DarkMode color="primary" sx={{ fontSize: 16 }} />
        ) : (
          <DesktopWindows color="primary" sx={{ fontSize: 16 }} />
        )}
      </IconButton>
    </Tooltip>
  )
}
