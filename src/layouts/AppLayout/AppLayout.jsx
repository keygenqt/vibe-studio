/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'theme']
 * INFO: The app window frame: the startup gate, the title bar and the focus dim.
 */
import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { LoaderView } from '../components'
import { DURATION_DEFAULT } from '../../constants'
import { useInfo } from '../../core'
import { useWindowMaximized } from '../../hooks'
import { AppStorage, AppUtils } from '../../utils'

import { LinuxBar } from './elements/LinuxBar'
import { MacosBar } from './elements/MacosBar'

export function AppLayout(props) {
  const theme = useTheme()
  const { os } = useInfo()
  const maximized = useWindowMaximized()

  // the frameless Linux window paints its own frame: radius and border,
  // both off when the maximized window fills the screen
  const linuxFrame = os === 'linux' && !maximized

  // the bootstrap background served the pre-app paint: from here the
  // rounded frame owns the window — the corners must show through
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'transparent'
  }, [])

  // the platform class on the frame: per-platform CSS keys off it
  const platform = os ? 'App' + os.charAt(0).toUpperCase() + os.slice(1) : undefined

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
          borderRadius: linuxFrame ? 2 : undefined,
          border: linuxFrame ? '1px solid' : undefined,
          borderColor: 'divider',
          backgroundColor: 'background.default',
        }}
      >
        <LoaderView
          // empty on a first run: the loader paints the default light pair
          textColor={
            AppUtils.isDark(
              AppStorage.readWindowBackground() ?? theme.palette.background.default
            )
              ? 'common.white'
              : 'common.black'
          }
        />
      </Box>
    )
  return (
    <Box
      height={1}
      className={platform}
      sx={theme => ({
        boxSizing: 'border-box',
        // the frame paints the window: the bar strip over it is transparent
        backgroundColor: 'background.default',
        borderRadius: linuxFrame ? 2 : undefined,
        border: linuxFrame ? '1px solid' : undefined,
        borderColor: 'divider',
        overflow: 'hidden',
        // bridge for plain CSS: styles.css reads the theme through these vars
        '--app-paper': theme.palette.background.paper,
        '--duration-default': `${DURATION_DEFAULT}ms`,
      })}
    >
      {/* the dim sits on the content: the window background stays solid */}
      <Box
        className={props.isFocus ? 'WindowFocus' : 'WindowUnfocus'}
        sx={{ height: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* the bar follows the platform: window controls on Linux, traffic lights on macOS */}
        {os === 'linux' ? <LinuxBar /> : <MacosBar />}
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>{props.children}</Box>
      </Box>
    </Box>
  )
}

AppLayout.propTypes = {
  ready: PropTypes.bool.isRequired,
  isFocus: PropTypes.bool.isRequired,
  children: PropTypes.node,
}
