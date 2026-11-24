/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The macOS title bar: the drag region under the native traffic lights.
 */
import { AppBar, Box, Stack, Toolbar } from '@mui/material'

import { ThemeAction } from './ThemeAction'

export function MacosBar() {
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
          <ThemeAction />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
