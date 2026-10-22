/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { List } from '@mui/material'
import HubOutlined from '@mui/icons-material/HubOutlined'
import TuneOutlined from '@mui/icons-material/TuneOutlined'

import { SettingsSidebarItem } from './SettingsSidebarItem'

// draft: providers only; a section returns with its feature
const ITEMS = [
  {
    path: '/settings/general',
    title: 'settings.t_general',
    description: 'settings.t_general_description',
    icon: <TuneOutlined />,
    match: ['/settings/general'],
  },
  {
    path: '/settings/providers',
    title: 'settings.t_providers',
    description: 'settings.t_providers_description',
    icon: <HubOutlined />,
    // active across the whole provider section, including model pages
    match: ['/settings/provider', '/settings/model'],
  },
]

export function SidebarView() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  return (
    <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {ITEMS.map(item => {
        const active = item.match.some(prefix => pathname.startsWith(prefix))
        return (
          <SettingsSidebarItem
            key={item.path}
            title={t(item.title)}
            description={t(item.description)}
            icon={item.icon}
            active={active}
            onClick={() => {
              // active section: no navigation, no duplicate history entries
              if (!active) navigate(item.path)
            }}
          />
        )
      })}
    </List>
  )
}
