/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'theme']
 * INFO: Theme cycle button: light, dark, system.
 */
import { useTranslation } from 'react-i18next'
import { IconButton, Tooltip } from '@mui/material'
import DarkMode from '@mui/icons-material/DarkMode'
import DesktopWindows from '@mui/icons-material/DesktopWindows'
import LightMode from '@mui/icons-material/LightMode'

import { useCoreSettings } from '../../../../hooks'

export function ThemeAction() {
  const { t } = useTranslation()
  const { settings, setTheme } = useCoreSettings()
  const theme = settings.appearance_theme
  return (
    <Tooltip title={t('main.t_theme')}>
      <IconButton
        size="small"
        sx={{ p: '2px' }}
        onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
      >
        {theme === 'light' ? (
          <LightMode sx={{ fontSize: 16 }} />
        ) : theme === 'dark' ? (
          <DarkMode sx={{ fontSize: 16 }} />
        ) : (
          <DesktopWindows sx={{ fontSize: 16 }} />
        )}
      </IconButton>
    </Tooltip>
  )
}
