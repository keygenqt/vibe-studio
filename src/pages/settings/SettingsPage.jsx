/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import { Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import { useWorkspace } from '../../hooks'
import { ShellLayout, SidebarLayout } from '../../components/layouts'
import { BackIconButton } from '../../components/buttons'
import { SidebarView } from './elements/SidebarView'

export function SettingsPage() {
  const workspace = useWorkspace()
  const { t } = useTranslation()
  // no render until the stored truth arrives — no startup animation
  if (!workspace.ready) return null
  return (
    <ShellLayout railActions={<BackIconButton />}>
      <SidebarLayout
        scrollPageKey={'settings.content'}
        scrollSidebarKey={'settings.nav'}
        sidebarTitle={
          <Typography variant={'h5'} fontWeight={500} color={'text.primary'}>
            {t('main.t_settings')}
          </Typography>
        }
        sidebar={{
          // collapse is a chat-shell feature; settings sidebar is always open
          collapsed: false,
          width: workspace.sideBarSize,
          dragging: workspace.dragging,
          onHandlePointerDown: workspace.onSidebarHandlePointerDown,
        }}
        sidebarView={<SidebarView />}
      >
        <Outlet />
      </SidebarLayout>
    </ShellLayout>
  )
}
