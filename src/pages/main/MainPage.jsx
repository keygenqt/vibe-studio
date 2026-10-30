/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 * INFO: The chat shell: group sidebar, chat area, composer.
 */
import * as React from 'react'
import { matchPath, Outlet, useLocation, useNavigate } from 'react-router'
import { Box } from '@mui/material'
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
import { InputView } from './elements/InputView'

export function MainPage() {
  const workspace = useCoreWorkspace()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { groupsChat, chats, models, history } = useCoreGroupsChat()
  // the active chat is the routed one: no mirror state
  const chatId = Number(matchPath(AppRoutes.chat(), pathname)?.params.chatId) || null
  // the composer belongs to the open chat only
  const hasChat = chatId !== null && Boolean(chats?.some(chat => chat.id === chatId))
  // the sidebar highlight is the persisted selection, not the route:
  // it lands together with the chat it belongs to — one paint
  const activeChatId = history?.find(item => item.current_is_active)?.current_active_chat_id || null
  // the active group is the persisted selection; until the user picks
  // one it falls back to the first group — highlight only, no write
  const activeId =
    history?.find(item => item.current_is_active)?.group_chat_id ?? groupsChat?.[0]?.id ?? null

  // restore the persisted chat once: the route always starts at '/'
  // and the journal is empty on a fresh window
  React.useEffect(() => {
    if (!groupsChat || !history || !chats) return
    if (pathname !== AppRoutes.main()) return
    const active = history.find(item => item.current_is_active)
    const restoredId = active?.current_active_chat_id
    if (!restoredId || !chats.some(chat => chat.id === restoredId)) return
    AppNav.open(navigate, AppRoutes.chat(restoredId))
  }, [groupsChat, history, chats])

  const createChat = () => {
    if (activeId === null) return
    Methods.save_chat({ id: null, name: '', group_chat_id: activeId })
      .then(state => {
        const savedId = state.history.find(item => item.current_is_active)?.current_active_chat_id
        if (savedId) AppNav.open(navigate, AppRoutes.chat(savedId))
      })
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
            history={history}
            activeId={activeId}
            onActivate={groupId =>
              Methods.select_group_chat(groupId, null)
                .then(state => {
                  const selectedId = state.history.find(
                    item => item.current_is_active
                  )?.current_active_chat_id
                  if (selectedId) {
                    AppNav.open(navigate, AppRoutes.chat(selectedId))
                  } else {
                    AppNav.open(navigate, AppRoutes.main())
                  }
                })
                .catch(() => {})
            }
            activeChatId={activeChatId}
            onActivateChat={(groupId, chatId) => {
              Methods.select_group_chat(groupId, chatId).catch(console.error)
              AppNav.open(navigate, AppRoutes.chat(chatId))
            }}
          />
        }
      >
        {/* the paper shell of the chat area: pages render inside it */}
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          <Outlet />
        </Box>
        {/* horizontal mirror of the sidebar handle: dragging up grows the composer */}
        {hasChat && (
          <>
            <HandleView
              orientation="horizontal"
              onPointerDown={workspace.onComposerHandlePointerDown}
            />
            <InputView height={workspace.chatInputSize} chatId={chatId} />
          </>
        )}
      </SidebarLayout>
    </ShellLayout>
  )
}
