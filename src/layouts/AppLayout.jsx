/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'theme']
 * INFO: The app window frame: startup loader gate, background and focus dim.
 */
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

import { LoaderView } from './components'
import { DURATION_DEFAULT } from '../constants'
import { AppStorage, AppUtils } from '../utils'

export function AppLayout(props) {
  // the startup gate: the loader holds the window until the startup loads land
  if (!props.ready)
    return (
      <Box
        height={1}
        data-tauri-drag-region
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LoaderView
          textColor={
            AppUtils.isDark(AppStorage.readWindowBackground()) ? 'common.white' : 'common.black'
          }
        />
      </Box>
    )
  return (
    <Box
      height={1}
      sx={theme => ({
        // bridge for plain CSS: styles.css reads the theme through these vars
        '--app-paper': theme.palette.background.paper,
        '--duration-default': `${DURATION_DEFAULT}ms`,
      })}
    >
      {/* the dim sits on the content: the window background stays solid */}
      <Box className={props.isFocus ? 'WindowFocus' : 'WindowUnfocus'} height={1}>
        {props.children}
      </Box>
    </Box>
  )
}

AppLayout.propTypes = {
  ready: PropTypes.bool.isRequired,
  isFocus: PropTypes.bool.isRequired,
  children: PropTypes.node,
}
