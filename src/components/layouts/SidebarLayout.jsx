/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

import { HandleView } from '../views'

export function SidebarLayout(props) {
  const { collapsed, width, dragging, onHandlePointerDown } = props.sidebar
  return (
    <>
      {/* stands still, fades out while the content column covers it */}
      <Box
        sx={theme => ({
          width: width,
          flexShrink: 0,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          overflow: 'hidden',
          opacity: collapsed ? 0 : 1,
          boxSizing: 'border-box',
          p: 1,
          // fade leads the slide by 100ms and trails it by 100ms
          transition: dragging
            ? 'none'
            : theme.transitions.create(['opacity'], {
                duration: theme.transitions.duration.standard + 200,
                easing: theme.transitions.easing.sharp,
                delay: -100,
              }),
        })}
      >
        {props.sidebarView}
      </Box>
      <HandleView orientation="vertical" onPointerDown={onPointerDownGuard(props)} />
      <Box
        sx={theme => ({
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          // slides over the standing sidebar: width + two gaps + handle
          marginLeft: collapsed ? `calc(-1 * (${width}px + ${theme.spacing(2)} + 2px))` : 0,
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'background.default',
          transition: dragging
            ? 'none'
            : theme.transitions.create(['margin'], {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeInOut,
              }),
        })}
      >
        {props.children}
      </Box>
    </>
  )
}

function onPointerDownGuard(props) {
  return props.sidebar.collapsed ? undefined : props.sidebar.onHandlePointerDown
}

SidebarLayout.propTypes = {
  sidebar: PropTypes.shape({
    collapsed: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    dragging: PropTypes.bool.isRequired,
    onHandlePointerDown: PropTypes.func.isRequired,
  }).isRequired,
  sidebarView: PropTypes.element.isRequired,
  children: PropTypes.node,
}
