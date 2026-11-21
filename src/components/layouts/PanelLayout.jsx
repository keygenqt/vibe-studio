/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The sidebar layout: the sidebar and content zones over the base frame.
 */
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

import { SIDE_BAR_SIZE_MAX, SIDE_BAR_SIZE_MIN } from '../../constants'
import { useWorkspace, WorkspaceMethod } from '../../core'
import { useDragResize } from '../../hooks'
import { HandleView } from '../views'
import { BaseLayout } from './BaseLayout/BaseLayout'
import { ScrollLayout } from './ScrollLayout'

export function PanelLayout(props) {
  const workspace = useWorkspace()
  const drag = useDragResize({
    axis: 'x',
    getSize: () => workspace.sideBarSize,
    onMove: size => {
      const next = Math.max(SIDE_BAR_SIZE_MIN, Math.min(Math.round(size), SIDE_BAR_SIZE_MAX))
      if (next !== workspace.sideBarSize) {
        WorkspaceMethod.save({ sideBarSize: next })
      }
    },
  })

  return (
    <BaseLayout railActions={props.railActions} railFooter={props.railFooter}>
      <Box
        sx={theme => ({
          width: workspace.sideBarSize,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          opacity: workspace.sideBarCollapsed ? 0 : 1,
          boxSizing: 'border-box',
          transition: drag.dragging
            ? 'none'
            : theme.transitions.create(['opacity'], {
                duration: theme.transitions.duration.standard + 100,
                easing: theme.transitions.easing.sharp,
              }),
        })}
      >
        <Box
          sx={{
            flexShrink: 0,
            minHeight: 45,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2,
            backgroundColor: 'background.paper',
            boxSizing: 'border-box',
            px: 2,
            py: 1,
          }}
        >
          {props.sidebarTitle}
        </Box>
        {props.scrollSidebar === false ? (
          props.sidebarView
        ) : (
          <ScrollLayout scrollKey={props.scrollSidebarKey} ready={props.sidebarReady ?? true}>
            {props.sidebarView}
          </ScrollLayout>
        )}
      </Box>
      <HandleView
        orientation="vertical"
        onPointerDown={workspace.sideBarCollapsed ? undefined : drag.onHandlePointerDown}
      />
      <Box
        sx={theme => ({
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginLeft: workspace.sideBarCollapsed
            ? `calc(-1 * (${workspace.sideBarSize}px + ${theme.spacing(2)} + 2px))`
            : 0,
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'background.default',
          transition: drag.dragging
            ? 'none'
            : theme.transitions.create(['margin'], {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeInOut,
              }),
        })}
      >
        {props.scrollContent === false ? (
          props.children
        ) : (
          <ScrollLayout scrollKey={props.scrollPageKey}>{props.children}</ScrollLayout>
        )}
      </Box>
    </BaseLayout>
  )
}

PanelLayout.propTypes = {
  railActions: PropTypes.node,
  railFooter: PropTypes.node,
  sidebarTitle: PropTypes.node,
  sidebarView: PropTypes.element.isRequired,
  // the sidebar data readiness: the loader covers the zone until it lands
  sidebarReady: PropTypes.bool,
  scrollSidebar: PropTypes.bool,
  scrollSidebarKey: PropTypes.string,
  // the content scroll belongs to the layout; the chat owns its own
  scrollContent: PropTypes.bool,
  scrollPageKey: PropTypes.string,
  children: PropTypes.node,
}
