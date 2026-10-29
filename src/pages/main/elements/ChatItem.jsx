/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { ListItem, ListItemButton, ListItemText } from '@mui/material'
import DeleteOutline from '@mui/icons-material/DeleteOutline'

import { TooltipIconButton } from '../../../components/buttons'

export function ChatItem(props) {
  const { t } = useTranslation()
  // the delete action belongs to the active chat only
  return (
    <ListItem
      disablePadding
      secondaryAction={
        props.active ? (
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
        ) : undefined
      }
    >
      <ListItemButton
        selected={props.active}
        onClick={props.onClick}
        sx={{ borderRadius: 2, px: '8px', py: '6px' }}
      >
        <ListItemText
          primary={props.title}
          slotProps={{ primary: { noWrap: true, color: 'text.primary' } }}
        />
      </ListItemButton>
    </ListItem>
  )
}

ChatItem.propTypes = {
  title: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
}
