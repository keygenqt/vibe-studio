/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Card, ListItemButton, Stack, Typography } from '@mui/material'

import { BadgeView } from '../../../components/views'

export function SettingsSidebarItem(props) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'panel.main',
      }}
    >
      <ListItemButton selected={props.active} onClick={props.onClick} sx={{ px: '8px', py: '6px' }}>
        <Stack
          direction={'row'}
          spacing={2}
          alignItems={'center'}
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          <BadgeView active={props.active}>{props.icon}</BadgeView>
          <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography fontWeight={600} noWrap color={'text.primary'} sx={{ minWidth: 0 }}>
              {props.title}
            </Typography>
            <Typography variant={'body2'} noWrap color={'text.secondary'}>
              {props.description}
            </Typography>
          </Stack>
        </Stack>
      </ListItemButton>
    </Card>
  )
}

SettingsSidebarItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.node,
  active: PropTypes.bool,
  onClick: PropTypes.func,
}
