/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Box, Card, ListItemButton, ListItemText } from '@mui/material'

export function SettingsSidebarItem(props) {
  return (
    <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: 'panel.main' }}>
      <ListItemButton selected={props.active} onClick={props.onClick} sx={{ px: '8px', py: '6px' }}>
        <Box
          sx={{
            mr: 1,
            mt: '7px',
            width: 32,
            height: 32,
            borderRadius: '50%',
            alignSelf: 'flex-start',
            bgcolor: 'action.selected',
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& .MuiSvgIcon-root': { fontSize: 20 },
          }}
        >
          {props.icon}
        </Box>
        <ListItemText
          primary={props.title}
          secondary={props.description}
          slotProps={{
            primary: { noWrap: true },
          }}
        />
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
