/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { useTheme, Box, AppBar, Toolbar, Typography, IconButton, Tooltip } from '@mui/material'
import DarkMode from '@mui/icons-material/DarkMode'
import DesktopWindows from '@mui/icons-material/DesktopWindows'
import LightMode from '@mui/icons-material/LightMode'

import { useEffectPageScroll } from '../base'
import { Methods } from '../modules'

export function AppBarLayout(props) {
  const theme = useTheme()
  const { t } = useTranslation()
  const themeOverride = useSelector(state => state.appState.settings.theme)
  const scrollTop = useEffectPageScroll()

  const cycleTheme = () => {
    const next = themeOverride === 'light' ? 'dark' : themeOverride === 'dark' ? null : 'light'
    Methods.settings_set_theme(next)
  }
  const { pathname } = useLocation()
  React.useEffect(() => {
    const el = document.getElementById('page_scroll')
    if (el) el.scrollTop = scrollTop
  }, [pathname])
  return (
    <>
      <AppBar
        position="static"
        variant="dense"
        sx={{
          zIndex: 99,
          position: 'relative',
          backgroundColor: 'transparent',
          boxShadow: `0 8px 8px ${theme.palette.background.default}`,
          transition: 'none !important',
        }}
      >
        <Toolbar id={'toolbarDrag1'} data-tauri-drag-region>
          <Box sx={{ minWidth: 30 }}>{props.actions}</Box>
          <Box sx={{ flexGrow: 1 }} />
          <Typography
            id={'toolbarDrag2'}
            data-tauri-drag-region
            color="text.primary"
            component="div"
            sx={{ fontSize: 13 }}
          >
            Vibe Studio
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
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
      <Box id="page_scroll" className={'AppScroll'}>
        {props.children}
      </Box>
    </>
  )
}

AppBarLayout.propTypes = {
  actions: PropTypes.element,
  children: PropTypes.element.isRequired,
}
