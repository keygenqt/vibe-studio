/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { Box, AppBar, Toolbar, IconButton, Tooltip } from '@mui/material'
import DarkMode from '@mui/icons-material/DarkMode'
import DesktopWindows from '@mui/icons-material/DesktopWindows'
import LightMode from '@mui/icons-material/LightMode'

import { Methods } from '../modules'

export function AppBarLayout(props) {
  const { t } = useTranslation()
  const themeOverride = useSelector(state => state.appState.settings.theme)

  const cycleTheme = () => {
    const next = themeOverride === 'light' ? 'dark' : themeOverride === 'dark' ? 'system' : 'light'
    Methods.settings_set_theme(next)
  }

  return (
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
        <Toolbar id={'toolbarDrag1'} data-tauri-drag-region>
          <Box sx={{ minWidth: 30 }}>{props.actions}</Box>
          <Box sx={{ flexGrow: 1 }} data-tauri-drag-region />
          <Tooltip title={t('main.t_theme')}>
            <IconButton onClick={cycleTheme} size="small" color="primary">
              {themeOverride === 'light' ? (
                <LightMode color="primary" sx={{ fontSize: 16 }} />
              ) : themeOverride === 'dark' ? (
                <DarkMode color="primary" sx={{ fontSize: 16 }} />
              ) : (
                <DesktopWindows color="primary" sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>{props.children}</Box>
    </Box>
  )
}

AppBarLayout.propTypes = {
  actions: PropTypes.element,
  children: PropTypes.element.isRequired,
}
