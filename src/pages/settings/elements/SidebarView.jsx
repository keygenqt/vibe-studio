/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The settings section navigation.
 */
import { matchPath, useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { List } from '@mui/material'
import ForumOutlined from '@mui/icons-material/ForumOutlined'
import HubOutlined from '@mui/icons-material/HubOutlined'
import TuneOutlined from '@mui/icons-material/TuneOutlined'

import { SettingsSidebarItem } from './SettingsSidebarItem'
import { AppRoutes } from '../../../constants'
import { AppNav } from '../../../utils'

const ITEMS = [
  {
    path: AppRoutes.settingsGeneral(),
    title: 'settings.t_general',
    description: 'settings.t_general_description',
    icon: <TuneOutlined />,
    match: [AppRoutes.settingsGeneral()],
  },
  {
    path: AppRoutes.settingsProviders(),
    title: 'settings.t_providers',
    description: 'settings.t_providers_description',
    icon: <HubOutlined />,
    match: [
      AppRoutes.settingsProviders(),
      AppRoutes.provider(),
      AppRoutes.model(),
      AppRoutes.models(),
    ],
  },
  {
    path: AppRoutes.settingsGroupsChat(),
    title: 'settings.t_groups_chat',
    description: 'settings.t_groups_chat_description',
    icon: <ForumOutlined />,
    match: [AppRoutes.settingsGroupsChat(), AppRoutes.groupChat()],
  },
]

export function SidebarView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {ITEMS.map(item => {
        const active = item.match.some(pattern => Boolean(matchPath(pattern, pathname)))
        return (
          <SettingsSidebarItem
            key={item.path}
            title={t(item.title)}
            description={t(item.description)}
            icon={item.icon}
            active={active}
            onClick={() => {
              if (matchPath(item.path, pathname)) return
              AppNav.openWithReplace(navigate, item.path, AppRoutes.settings())
            }}
          />
        )
      })}
    </List>
  )
}
