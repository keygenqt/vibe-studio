/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The Linux title bar: window controls, drag region and the theme action.
 */
import { getCurrentWindow } from '@tauri-apps/api/window'
import { AppBar, Box, IconButton, Stack, Toolbar } from '@mui/material'
import Close from '@mui/icons-material/Close'
import CropSquare from '@mui/icons-material/CropSquare'
import Minimize from '@mui/icons-material/Minimize'

import { ThemeAction } from './ThemeAction'

export function LinuxBar() {
  const appWindow = getCurrentWindow()
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
          <ThemeAction />
        </Stack>
        <Box sx={{ flexGrow: 1 }} data-tauri-drag-region />
        {/* the desktop order: minimize, maximize, close in the corner */}
        <Stack direction={'row'} spacing={1} sx={{ marginRight: '-6px' }}>
          <IconButton
            size="small"
            sx={{ p: '2px' }}
            onClick={() => appWindow.minimize().catch(console.error)}
          >
            <Minimize sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{ p: '2px' }}
            onClick={() => appWindow.toggleMaximize().catch(console.error)}
          >
            <CropSquare sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{ p: '2px' }}
            onClick={() => appWindow.close().catch(console.error)}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
