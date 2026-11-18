/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 * INFO: The chat shell: group sidebar, chat area, composer.
 */
import * as React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import ViewSidebar from '@mui/icons-material/ViewSidebar'
import Settings from '@mui/icons-material/Settings'

import {
  GroupsChatMethod,
  useChats,
  useGroupsChat,
  useHistory,
  useModels,
  useWorkspace,
  WorkspaceMethod,
} from '../../core'
import { AppRoutes } from '../../constants'
import { ShellLayout, SidebarLayout } from '../../components/layouts'
import { TooltipIconButton } from '../../components/buttons'
import { ErrorSnackbar } from '../../components/snackbars'
import { AppNav } from '../../utils'

import { SidebarTitle } from './elements/SidebarTitle'
import { SidebarView } from './elements/SidebarView'

export function MainPage() {
  const workspace = useWorkspace()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { groupsChat } = useGroupsChat()
  const { chats } = useChats()
  const { history } = useHistory()
  const { models } = useModels()
  const [error, setError] = React.useState(null)

  // the sidebar highlight is the persisted selection, not the route:
  // it lands together with the chat it belongs to — one paint
  const activeChatId = history?.find(item => item.currentIsActive)?.currentActiveChatId || null

  // the active group is the persisted selection; until the user picks
  // one it falls back to the first group — highlight only, no write
  const activeId =
    history?.find(item => item.currentIsActive)?.groupChatId ?? groupsChat?.[0]?.id ?? null

  // the rail toggle persists the collapsed flag of the sidebar
  const toggleSidebar = () =>
    WorkspaceMethod.save({ sideBarCollapsed: !workspace.sideBarCollapsed })

  // restore the persisted chat once: the route always starts at '/'
  // and the journal is empty on a fresh window
  React.useEffect(() => {
    if (!groupsChat || !history || !chats) return
    if (pathname !== AppRoutes.main()) return
    const active = history.find(item => item.currentIsActive)
    const restoredId = active?.currentActiveChatId
    if (!restoredId || !chats.some(chat => chat.id === restoredId)) return
    AppNav.open(navigate, AppRoutes.chat(restoredId))
  }, [groupsChat, history, chats])

  return (
    <>
      <ErrorSnackbar text={error} onClose={() => setError(null)} />
      <ShellLayout
        railActions={
          <>
            <TooltipIconButton title={t('main.t_sidebar')} onClick={toggleSidebar}>
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
          sidebarTitle={
            <SidebarTitle
              canAdd={groupsChat !== null && groupsChat.length > 0}
              onAdd={() => {
                if (activeId === null) return
                GroupsChatMethod.saveChat({ id: null, name: '', groupChatId: activeId })
                  .then(state => {
                    const savedId = state.history.find(
                      item => item.currentIsActive
                    )?.currentActiveChatId
                    if (savedId) AppNav.open(navigate, AppRoutes.chat(savedId))
                  })
                  .catch(err => setError(String(err)))
              }}
            />
          }
          sidebarView={
            <SidebarView
              groupsChat={groupsChat}
              chats={chats}
              models={models}
              history={history}
              activeId={activeId}
              onActivate={groupId =>
                GroupsChatMethod.selectGroupChat(groupId, null)
                  .then(state => {
                    const selectedId = state.history.find(
                      item => item.currentIsActive
                    )?.currentActiveChatId
                    if (selectedId) {
                      AppNav.open(navigate, AppRoutes.chat(selectedId))
                    } else {
                      AppNav.open(navigate, AppRoutes.main())
                    }
                  })
                  .catch(err => setError(String(err)))
              }
              activeChatId={activeChatId}
              onActivateChat={(groupId, chatId) => {
                GroupsChatMethod.selectGroupChat(groupId, chatId).catch(err =>
                  setError(String(err))
                )
                AppNav.open(navigate, AppRoutes.chat(chatId))
              }}
            />
          }
        >
          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <Outlet />
          </Box>
        </SidebarLayout>
      </ShellLayout>
    </>
  )
}
