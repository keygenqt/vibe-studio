/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The chat composer: the input and the send button.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Button, Stack, TextField } from '@mui/material'
import Send from '@mui/icons-material/Send'
import Stop from '@mui/icons-material/Stop'

import { Methods } from '../../../modules'

export function InputView(props) {
  const { t } = useTranslation()
  const { draft, setDraft, send, sending, streaming, stop, onAttachments } = props
  const inputRef = React.useRef(null)

  // the disabled input cannot take focus, so refocus after sending ends
  React.useEffect(() => {
    if (!sending) inputRef.current?.focus()
  }, [sending])

  // the paste is intercepted: Rust resolves the clipboard kind — text
  // goes to the draft at the cursor, files and images to the attachments
  const onPaste = event => {
    event.preventDefault()
    Methods.clipboard_read()
      .then(content => {
        if (!content) return
        if (content.kind === 'text') {
          const input = inputRef.current
          const start = input?.selectionStart ?? draft.length
          const end = input?.selectionEnd ?? draft.length
          setDraft(draft.slice(0, start) + content.text + draft.slice(end))
          const cursor = start + content.text.length
          // the cursor restores after the controlled update paints
          requestAnimationFrame(() => input?.setSelectionRange(cursor, cursor))
        } else if (content.kind === 'files') {
          onAttachments(content.paths.map(path => ({ kind: 'file', path })))
        } else {
          onAttachments([{ kind: 'image', png: content.png }])
        }
      })
      .catch(console.error)
  }

  return (
    <Stack
      direction={'row'}
      spacing={1}
      alignItems={'flex-start'}
      sx={{ flexGrow: 1, minHeight: 0, '& .MuiFormControl-root': { boxSizing: 'border-box' } }}
    >
      <TextField
        multiline
        fullWidth
        variant={'standard'}
        inputRef={inputRef}
        placeholder={t('chat.t_placeholder')}
        value={draft}
        onChange={event => setDraft(event.target.value)}
        sx={{
          flexGrow: 1,
          minWidth: 0,
          height: '100%',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          paddingX: 1.5,
          paddingY: 1,
        }}
        slotProps={{
          input: { disableUnderline: true, sx: { height: '100%', alignItems: 'flex-start' } },
          htmlInput: {
            className: 'ScrollArea',
            sx: { height: '100% !important', overflowY: 'auto !important' },
            autoComplete: 'off',
            autoCorrect: 'off',
            autoCapitalize: 'off',
            spellCheck: false,
            onKeyDown: event => {
              if (event.key === 'Enter' && !event.shiftKey && !streaming) {
                event.preventDefault()
                send()
              }
            },
            onPaste: onPaste,
          },
        }}
      />
      <Stack direction={'row'} spacing={1} alignItems={'center'} sx={{ flexShrink: 0, height: 50 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={streaming ? stop : send}
          disabled={!streaming && sending}
          startIcon={
            streaming ? (
              <Stop sx={{ color: 'primary.contrastText' }} />
            ) : (
              <Send sx={{ color: 'primary.contrastText' }} />
            )
          }
          sx={{
            minWidth: 48,
            height: 48,
            '& .MuiButton-icon': {
              margin: 0,
            },
          }}
        />
      </Stack>
    </Stack>
  )
}

InputView.propTypes = {
  draft: PropTypes.string.isRequired,
  setDraft: PropTypes.func.isRequired,
  send: PropTypes.func.isRequired,
  sending: PropTypes.bool.isRequired,
  streaming: PropTypes.bool.isRequired,
  stop: PropTypes.func.isRequired,
  onAttachments: PropTypes.func.isRequired,
}
