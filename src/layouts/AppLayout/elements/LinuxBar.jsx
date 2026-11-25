/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The Linux title bar: window controls, drag region and the theme action.
 */
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useTranslation } from 'react-i18next'
import { AppBar, Box, IconButton, Stack, Toolbar, Tooltip } from '@mui/material'
import Close from '@mui/icons-material/Close'
import CropSquare from '@mui/icons-material/CropSquare'
import DarkMode from '@mui/icons-material/DarkMode'
import DesktopWindows from '@mui/icons-material/DesktopWindows'
import LightMode from '@mui/icons-material/LightMode'
import Minimize from '@mui/icons-material/Minimize'

import { SettingsMethod, useSettings } from '../../../core/settings'

// the persistent circle of the bar actions; hover is explicit because the global IconButton hover repaints the base
// light steps a token up: the default base (4% black) is too faint on a light background
const circleSx = {
  p: '4px',
  bgcolor: (theme) => {
    return theme.palette.mode === 'dark' ? theme.palette.action.hover : theme.palette.action.selected
  },
  '&:hover': {
    bgcolor: (theme) => {
      return theme.palette.mode === 'dark' ? theme.palette.action.selected : theme.palette.action.focus
    }
  },
}

export function LinuxBar() {
  const appWindow = getCurrentWindow()
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
        <Stack direction={'row'} sx={{ marginLeft: '-6px' }}>
          <Tooltip title={t('main.t_theme')}>
            <IconButton size="small" sx={circleSx} onClick={onCycle}>
              {theme === 'light' ? (
                <LightMode sx={{ fontSize: 14 }} />
              ) : theme === 'dark' ? (
                <DarkMode sx={{ fontSize: 14 }} />
              ) : (
                <DesktopWindows sx={{ fontSize: 14 }} />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
        <Box sx={{ flexGrow: 1 }} data-tauri-drag-region />
        {/* the desktop order: minimize, maximize, close in the corner */}
        <Stack direction={'row'} spacing={1} sx={{ marginRight: '-6px' }}>
          <IconButton
            size="small"
            sx={circleSx}
            onClick={() => appWindow.minimize().catch(console.error)}
          >
            <Minimize sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton
            size="small"
            sx={circleSx}
            onClick={() => appWindow.toggleMaximize().catch(console.error)}
          >
            <CropSquare sx={{ fontSize: 14 }} />
          </IconButton>
          <IconButton
            size="small"
            sx={circleSx}
            onClick={() => appWindow.close().catch(console.error)}
          >
            <Close sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
