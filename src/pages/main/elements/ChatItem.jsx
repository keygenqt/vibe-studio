/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Card, ListItem, ListItemButton, ListItemText } from '@mui/material'
import DeleteOutline from '@mui/icons-material/DeleteOutline'

import { TooltipIconButton } from '../../../components/buttons'

export function ChatItem(props) {
  const { t } = useTranslation()
  return (
    <ListItem
      disablePadding
      secondaryAction={
        <TooltipIconButton
          size={'mini'}
          title={t('common.t_delete')}
          onClick={event => {
            event.stopPropagation()
            props.onDelete()
          }}
        >
          <DeleteOutline />
        </TooltipIconButton>
      }
    >
      <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', width: '100%' }}>
        <ListItemButton onClick={props.onClick} sx={{ px: '8px', py: '6px' }}>
          <ListItemText primary={props.title} slotProps={{ primary: { noWrap: true } }} />
        </ListItemButton>
      </Card>
    </ListItem>
  )
}

ChatItem.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
}
