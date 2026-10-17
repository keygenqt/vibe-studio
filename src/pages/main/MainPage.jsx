/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { RailView, useSidebar } from '../../base'
import { ShellLayout, SidebarLayout } from '../../layouts'

import { SidebarView } from './elements/sidebar/SidebarView'
import { ChatContent } from './elements/content/ChatContent'
import { ComposerView } from './elements/input/ComposerView'

export function MainPage() {
  const sidebar = useSidebar()
  // no render until the stored truth arrives — no startup animation
  if (!sidebar.ready) return null
  return (
    <ShellLayout rail={<RailView onToggleSidebar={sidebar.toggle} />}>
      <SidebarLayout sidebar={sidebar} sidebarView={<SidebarView />}>
        <ChatContent />
        <ComposerView />
      </SidebarLayout>
    </ShellLayout>
  )
}
