/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import * as React from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import ViewSidebar from '@mui/icons-material/ViewSidebar'
import Settings from '@mui/icons-material/Settings'

import { useCoreGroupsChat, useCoreWorkspace } from '../../hooks'
import { Methods } from '../../modules'
import { AppRoutes } from '../../constants'
import { ShellLayout, SidebarLayout } from '../../components/layouts'
import { TooltipIconButton } from '../../components/buttons'
import { HandleView } from '../../components/views'
import { AppNav } from '../../utils'

import { SidebarTitle } from './elements/SidebarTitle'
import { SidebarView } from './elements/SidebarView'
import { ChatContent } from './elements/ChatContent'
import { ComposerView } from './elements/ComposerView'

export function MainPage() {
  const workspace = useCoreWorkspace()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { groupsChat, chats, models } = useCoreGroupsChat()
  const [activeId, setActiveId] = React.useState(null)
  const [activeChatId, setActiveChatId] = React.useState(null)

  // the first group is active until the user picks another; a group
  // deletion falls back to the first remaining one
  React.useEffect(() => {
    if (groupsChat === null) return
    setActiveId(prev =>
      prev !== null && groupsChat.some(group => group.id === prev)
        ? prev
        : (groupsChat[0]?.id ?? null)
    )
  }, [groupsChat])

  const createChat = () => {
    if (activeId === null) return
    Methods.save_chat({ id: null, name: '', group_chat_id: activeId })
      .then(saved => setActiveChatId(saved.id))
      .catch(() => {})
  }

  // no render until the stored truth arrives — no startup animation
  if (!workspace.ready) return null

  return (
    <ShellLayout
      railActions={
        <>
          <TooltipIconButton title={t('main.t_sidebar')} onClick={workspace.toggleSidebar}>
            <ViewSidebar />
          </TooltipIconButton>
        </>
      }
      railFooter={
        <TooltipIconButton
          title={t('main.t_settings')}
          onClick={() =>
            AppNav.open(navigate, AppRoutes.settings(), {
              viewTransition: true,
            })
          }
        >
          <Settings />
        </TooltipIconButton>
      }
    >
      <SidebarLayout
        scrollSidebarKey={'main.nav'}
        scrollPage={false}
        sidebar={{
          collapsed: workspace.sideBarCollapsed,
          width: workspace.sideBarSize,
          dragging: workspace.dragging,
          onHandlePointerDown: workspace.onSidebarHandlePointerDown,
        }}
        sidebarTitle={
          <SidebarTitle canAdd={groupsChat !== null && groupsChat.length > 0} onAdd={createChat} />
        }
        sidebarView={
          <SidebarView
            groupsChat={groupsChat}
            chats={chats}
            models={models}
            activeId={activeId}
            onActivate={setActiveId}
            activeChatId={activeChatId}
            onActivateChat={setActiveChatId}
          />
        }
      >
        <ChatContent />
        {/* horizontal mirror of the sidebar handle: dragging up grows the composer */}
        <HandleView
          orientation="horizontal"
          onPointerDown={workspace.onComposerHandlePointerDown}
        />
        <ComposerView height={workspace.chatInputSize} />
      </SidebarLayout>
    </ShellLayout>
  )
}
