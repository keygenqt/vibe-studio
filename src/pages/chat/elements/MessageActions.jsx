/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The message action bar: a row of small icon actions.
 */
import PropTypes from 'prop-types'
import { IconButton, Stack } from '@mui/material'
import ContentCopy from '@mui/icons-material/ContentCopy'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import Psychology from '@mui/icons-material/Psychology'
import Refresh from '@mui/icons-material/Refresh'
import Translate from '@mui/icons-material/Translate'

export function MessageActions(props) {
  return (
    <Stack direction={'row'} spacing={0.25}>
      {props.onClickCopy && (
        <IconButton size={'small'} onClick={props.onClickCopy}>
          <ContentCopy sx={{ fontSize: 14, color: 'text.secondary' }} />
        </IconButton>
      )}
      {props.onClickTranslate && (
        <IconButton size={'small'} onClick={props.onClickTranslate}>
          <Translate sx={{ fontSize: 16, color: 'text.secondary' }} />
        </IconButton>
      )}
      {props.onClickThinking && (
        <IconButton size={'small'} onClick={props.onClickThinking}>
          <Psychology sx={{ fontSize: 17, color: 'text.secondary' }} />
        </IconButton>
      )}
      {props.onClickRefresh && (
        <IconButton size={'small'} onClick={props.onClickRefresh}>
          <Refresh sx={{ fontSize: 17, color: 'text.secondary' }} />
        </IconButton>
      )}
      {props.onClickDelete && (
        <IconButton size={'small'} onClick={props.onClickDelete}>
          <DeleteOutline sx={{ fontSize: 17, color: 'text.secondary' }} />
        </IconButton>
      )}
    </Stack>
  )
}

MessageActions.propTypes = {
  onClickCopy: PropTypes.func,
  onClickTranslate: PropTypes.func,
  onClickThinking: PropTypes.func,
  onClickRefresh: PropTypes.func,
  onClickDelete: PropTypes.func,
}
