/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The message action bar: a row of small icon actions.
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { IconButton, Stack } from '@mui/material'
import ContentCopy from '@mui/icons-material/ContentCopy'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import Psychology from '@mui/icons-material/Psychology'
import Refresh from '@mui/icons-material/Refresh'
import Translate from '@mui/icons-material/Translate'

export function MessageActions(props) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef(null)
  React.useEffect(() => () => timer.current && clearTimeout(timer.current), [])

  // the copy handler resolves `true` on success — the button paints
  // accent for 2 s; a failure is reported by the view itself
  const onClickCopy = () => {
    if (copied) return
    Promise.resolve(props.onClickCopy()).then(result => {
      if (result !== true) return
      setCopied(true)
      timer.current = setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Stack direction={'row'} spacing={0.25}>
      {props.onClickCopy && (
        <IconButton size={'small'} onClick={onClickCopy}>
          <ContentCopy sx={{ fontSize: 14, color: copied ? 'primary.main' : 'text.secondary' }} />
        </IconButton>
      )}
      {props.onClickTranslate && (
        <IconButton size={'small'} onClick={props.onClickTranslate}>
          <Translate
            sx={{ fontSize: 16, color: props.translateActive ? 'primary.main' : 'text.secondary' }}
          />
        </IconButton>
      )}
      {props.onClickThinking && (
        <IconButton size={'small'} onClick={props.onClickThinking}>
          <Psychology
            sx={{ fontSize: 17, color: props.thinkingActive ? 'primary.main' : 'text.secondary' }}
          />
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
  // resolves `true` on success — the copy button paints accent
  onClickCopy: PropTypes.func,
  onClickTranslate: PropTypes.func,
  onClickThinking: PropTypes.func,
  // true while the thinking block is displayed — accent paint
  translateActive: PropTypes.bool,
  thinkingActive: PropTypes.bool,
  onClickRefresh: PropTypes.func,
  onClickDelete: PropTypes.func,
}
