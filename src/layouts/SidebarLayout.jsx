/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

// @todo
const SIDEBAR_WIDTH = 260

export function SidebarLayout(props) {
  return (
    <>
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRadius: '8px',
          backgroundColor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        {props.sidebar}
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {props.children}
      </Box>
    </>
  )
}

SidebarLayout.propTypes = {
  sidebar: PropTypes.element.isRequired,
  children: PropTypes.node,
}
