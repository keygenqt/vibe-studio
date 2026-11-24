/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'theme']
 * INFO: The app page frame: draggable title bar, rail and the error toast.
 */
import PropTypes from 'prop-types'
import { AppBar, Box, Stack, Toolbar } from '@mui/material'

import { ThemeAction } from './elements/ThemeAction'
import { RailView } from './elements/RailView'
import { ErrorSnackbar } from '../components'
import { UiMethod, useError } from '../../core'

export function BaseLayout(props) {
  // the shell owns the single error toast: the pages raise it through UiMethod
  const { error } = useError()
  return (
    <>
      <ErrorSnackbar text={error} onClose={() => UiMethod.clearError()} />
      <Box
        height={1}
        boxSizing={'border-box'}
        sx={theme => ({
          p: `0 10px 10px`,
          backgroundColor: 'background.default',
          // the native widgets (spin buttons, scrollbars) follow the theme scheme
          colorScheme: theme.palette.mode,
        })}
      >
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
    </>
  )
}

BaseLayout.propTypes = {
  railActions: PropTypes.node,
  railFooter: PropTypes.node,
  children: PropTypes.node,
}
