/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import { Box } from '@mui/material'

import { RailView, useWorkspace } from '../../base'
import { ShellLayout, SidebarLayout } from '../../layouts'

import { SidebarView } from './elements/sidebar/SidebarView'
import { ChatContent } from './elements/content/ChatContent'
import { ComposerView } from './elements/input/ComposerView'

export function MainPage() {
  const workspace = useWorkspace()
  // no render until the stored truth arrives — no startup animation
  if (!workspace.ready) return null
  return (
    <ShellLayout rail={<RailView onToggleSidebar={workspace.toggleSidebar} />}>
      <SidebarLayout
        sidebar={{
          collapsed: workspace.sideBarCollapsed,
          width: workspace.sideBarSize,
          dragging: workspace.dragging,
          onHandlePointerDown: workspace.onSidebarHandlePointerDown,
        }}
        sidebarView={<SidebarView />}
      >
        <ChatContent />
        {/* horizontal mirror of the sidebar handle: dragging up grows the composer */}
        <Box
          onPointerDown={workspace.onComposerHandlePointerDown}
          sx={{
            height: '2px',
            width: 20,
            flexShrink: 0,
            alignSelf: 'center',
            borderRadius: 2,
            backgroundColor: 'divider',
            cursor: 'row-resize',
            '&:hover': { backgroundColor: 'primary.main' },
          }}
        />
        <ComposerView height={workspace.chatInputSize} />
      </SidebarLayout>
    </ShellLayout>
  )
}
