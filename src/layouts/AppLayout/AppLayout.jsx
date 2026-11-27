/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'theme']
 * INFO: The app window frame: the startup gate, the title bar and the focus dim.
 */
import { useEffect, useState } from 'react'
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

const STARTUP_HOLD_MS = 1000

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

  // the startup hold: the loader rides on top while the shell builds
  // underneath — collections, restore and the chat settle behind it
  const [booting, setBooting] = useState(true)
  useEffect(() => {
    if (!props.ready) return undefined
    const timer = setTimeout(() => setBooting(false), STARTUP_HOLD_MS)
    return () => clearTimeout(timer)
  }, [props.ready])

  return (
    <Box
      height={1}
      className={platform}
      sx={theme => ({
        boxSizing: 'border-box',
        // the overlay anchors to the frame
        position: 'relative',
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
        {props.ready ? <Box sx={{ flexGrow: 1, minHeight: 0 }}>{props.children}</Box> : null}
      </Box>
      {/* the same loader screen rides over the frame: the shell builds underneath */}
      {booting && (
        <Box
          data-tauri-drag-region
          sx={{
            position: 'absolute',
            // the bar strip: mirrors MuiToolbar minHeight in components.js
            top: 33,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.default',
            zIndex: 100,
          }}
        >
          <LoaderView
            // empty on a first run: the loader paints the default light pair
            textColor={
              AppUtils.isDark(AppStorage.readWindowBackground() ?? theme.palette.background.default)
                ? 'common.white'
                : 'common.black'
            }
          />
        </Box>
      )}
    </Box>
  )
}

AppLayout.propTypes = {
  ready: PropTypes.bool.isRequired,
  isFocus: PropTypes.bool.isRequired,
  children: PropTypes.node,
}
