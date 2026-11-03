/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The chat composer: the input, the EN sign and the send button.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Button, Stack, TextField } from '@mui/material'
import Send from '@mui/icons-material/Send'
import Stop from '@mui/icons-material/Stop'

export function InputView(props) {
  const { t } = useTranslation()
  const { draft, setDraft, send, sending, streaming, stop } = props
  const inputRef = React.useRef(null)

  // the disabled input cannot take focus, so refocus after sending ends
  React.useEffect(() => {
    if (!sending) inputRef.current?.focus()
  }, [sending])

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
}
