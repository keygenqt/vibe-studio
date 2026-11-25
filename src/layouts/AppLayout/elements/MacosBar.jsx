/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
fix: linux bar buttons background, loader on chat switch and startup, styled router error fallback
 */
import { useTranslation } from 'react-i18next'
import { AppBar, Box, IconButton, Stack, Toolbar, Tooltip } from '@mui/material'
import DarkMode from '@mui/icons-material/DarkMode'
import DesktopWindows from '@mui/icons-material/DesktopWindows'
import LightMode from '@mui/icons-material/LightMode'

import { SettingsMethod, useSettings } from '../../../core/settings'

export function MacosBar() {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const theme = settings.appearanceTheme
  // the cycle persists the choice; the resolved mode re-derives on the event
  const onCycle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    SettingsMethod.save({ appearanceTheme: next }).catch(console.error)
  }
  return (
    <AppBar
      position="static"
      variant="dense"
      sx={{
        zIndex: 99,
        position: 'relative',
        backgroundColor: 'transparent',
        // the base layout's 10px inset moved here with the bar
        px: '10px',
        transition: 'none !important',
      }}
    >
      <Toolbar data-tauri-drag-region>
        <Box sx={{ flexGrow: 1 }} data-tauri-drag-region />
        <Stack direction={'row'} sx={{ marginRight: '-6px' }}>
          <Tooltip title={t('main.t_theme')}>
            <IconButton size="small" sx={{ p: '2px' }} onClick={onCycle}>
              {theme === 'light' ? (
                <LightMode sx={{ fontSize: 16 }} />
              ) : theme === 'dark' ? (
                <DarkMode sx={{ fontSize: 16 }} />
              ) : (
                <DesktopWindows sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
