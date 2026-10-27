/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import ViewSidebar from '@mui/icons-material/ViewSidebar'
import Settings from '@mui/icons-material/Settings'

import { useCoreWorkspace } from '../../hooks'
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
        sidebarTitle={<SidebarTitle />}
        sidebarView={<SidebarView />}
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
