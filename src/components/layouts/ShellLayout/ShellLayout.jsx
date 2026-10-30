/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'theme']
 * INFO: The app shell frame: draggable title bar, rail, theme action.
 */
import PropTypes from 'prop-types'
import { AppBar, Box, Stack, Toolbar } from '@mui/material'

import { ThemeAction } from './elements/ThemeAction'
import { RailView } from './elements/RailView'

export function ShellLayout(props) {
  return (
    <Box height={1} boxSizing={'border-box'} sx={{ p: `0 10px 10px` }}>
      <Box height={1} sx={{ display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="static"
          variant="dense"
          sx={{
            zIndex: 99,
            position: 'relative',
            backgroundColor: 'transparent',
            transition: 'none !important',
          }}
        >
          <Toolbar data-tauri-drag-region>
            <Box sx={{ flexGrow: 1 }} data-tauri-drag-region />
            <Stack
              direction={'row'}
              sx={{
                marginRight: '-6px',
              }}
            >
              <ThemeAction />
            </Stack>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            display: 'flex',
            gap: 1,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <RailView actions={props.railActions} footer={props.railFooter} />
          </Box>
          {props.children}
        </Box>
      </Box>
    </Box>
  )
}

ShellLayout.propTypes = {
  railActions: PropTypes.node,
  railFooter: PropTypes.node,
  children: PropTypes.node,
}
