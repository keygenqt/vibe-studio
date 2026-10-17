/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import PropTypes from 'prop-types'
import { Card, ListItemButton, ListItemText } from '@mui/material'

export function SidebarItem(props) {
  return (
    <Card elevation={0} sx={{ mx: '8px', mb: '4px', borderRadius: 2, overflow: 'hidden' }}>
      <ListItemButton selected={props.chat.active} sx={{ px: '8px', py: '6px' }}>
        <ListItemText primary={props.chat.title} slotProps={{ primary: { noWrap: true } }} />
      </ListItemButton>
    </Card>
  )
}

SidebarItem.propTypes = {
  chat: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    active: PropTypes.bool,
  }).isRequired,
}
