/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import * as React from 'react'
import { Box } from '@mui/material'

import { useWorkspace } from '../../hooks'
import { ShellLayout, SidebarLayout } from '../../components/layouts'
import { BackIconButton } from '../../components/buttons'

import { SidebarView } from './elements/SidebarView'
import { ProvidersTab } from './elements/ProvidersTab'
import { ModelsTab } from './elements/ModelsTab'
import { PromptsTab } from './elements/PromptsTab'
import { GeneralTab } from './elements/GeneralTab'
import { AppearanceTab } from './elements/AppearanceTab'
import { AboutTab } from './elements/AboutTab'

export function SettingsPage() {
  const workspace = useWorkspace()
  const [tab, setTab] = React.useState('providers')
  // no render until the stored truth arrives — no startup animation
  if (!workspace.ready) return null
  return (
    <ShellLayout railActions={<BackIconButton />}>
      <SidebarLayout
        sidebar={{
          // collapse is a chat-shell feature; settings sidebar is always open
          collapsed: false,
          width: workspace.sideBarSize,
          dragging: workspace.dragging,
          onHandlePointerDown: workspace.onSidebarHandlePointerDown,
        }}
        sidebarView={<SidebarView tab={tab} onTab={setTab} />}
      >
        <Box
          className="ScrollArea"
          data-scroll-key="settings.content"
          sx={{
            flexGrow: 1,
            minHeight: 0,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            boxSizing: 'border-box',
            p: 1,
          }}
        >
          {tab === 'providers' && <ProvidersTab />}
          {tab === 'models' && <ModelsTab />}
          {tab === 'prompts' && <PromptsTab />}
          {tab === 'general' && <GeneralTab />}
          {tab === 'appearance' && <AppearanceTab />}
          {tab === 'about' && <AboutTab />}
        </Box>
      </SidebarLayout>
    </ShellLayout>
  )
}
