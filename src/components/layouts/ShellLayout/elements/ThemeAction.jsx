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

import { useCoreWorkspace } from '../../../../hooks'

export function ThemeAction() {
  const { t } = useTranslation()
  const { themeChoice, setTheme } = useCoreWorkspace()
  return (
    <Tooltip title={t('main.t_theme')}>
      <IconButton
        size="small"
        sx={{ p: '2px' }}
        onClick={() =>
          setTheme(themeChoice === 'light' ? 'dark' : themeChoice === 'dark' ? 'system' : 'light')
        }
      >
        {themeChoice === 'light' ? (
          <LightMode sx={{ fontSize: 16 }} />
        ) : themeChoice === 'dark' ? (
          <DarkMode sx={{ fontSize: 16 }} />
        ) : (
          <DesktopWindows sx={{ fontSize: 16 }} />
        )}
      </IconButton>
    </Tooltip>
  )
}
