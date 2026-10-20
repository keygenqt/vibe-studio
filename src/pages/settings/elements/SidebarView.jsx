/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, List } from '@mui/material'

import { SidebarItem } from '../../../components/views'

const TABS = [
  { id: 'providers', title: 'settings.t_providers' },
  { id: 'models', title: 'settings.t_models' },
  { id: 'prompts', title: 'settings.t_prompts' },
  { id: 'general', title: 'settings.t_general' },
  { id: 'appearance', title: 'settings.t_appearance' },
  { id: 'about', title: 'settings.t_about' },
]

export function SidebarView(props) {
  const { t } = useTranslation()
  return (
    <Box className="ScrollArea" data-scroll-key="settings.nav" height={1}>
      <List dense disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {TABS.map(item => (
          <SidebarItem
            key={item.id}
            title={t(item.title)}
            active={props.tab === item.id}
            onClick={() => props.onTab(item.id)}
          />
        ))}
      </List>
    </Box>
  )
}

SidebarView.propTypes = {
  tab: PropTypes.string.isRequired,
  onTab: PropTypes.func.isRequired,
}
