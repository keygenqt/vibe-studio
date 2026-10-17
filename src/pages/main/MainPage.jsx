/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { RailView } from '../../base'
import { ShellLayout, SidebarLayout } from '../../layouts'

import { SidebarView } from './elements/sidebar/SidebarView'
import { ChatContent } from './elements/content/ChatContent'
import { ComposerView } from './elements/input/ComposerView'

export function MainPage() {
  return (
    <ShellLayout rail={<RailView />}>
      <SidebarLayout sidebar={<SidebarView />}>
        <ChatContent />
        <ComposerView />
      </SidebarLayout>
    </ShellLayout>
  )
}
