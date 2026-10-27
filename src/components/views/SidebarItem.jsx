/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Card, ListItemButton, ListItemText } from '@mui/material'

export function SidebarItem(props) {
  return (
    <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <ListItemButton selected={props.active} onClick={props.onClick} sx={{ px: '8px', py: '6px' }}>
        <ListItemText primary={props.title} slotProps={{ primary: { noWrap: true } }} />
      </ListItemButton>
    </Card>
  )
}

SidebarItem.propTypes = {
  title: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
}
