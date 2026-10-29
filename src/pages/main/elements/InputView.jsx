/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, CircularProgress, IconButton, Stack, TextField } from '@mui/material'
import Send from '@mui/icons-material/Send'

import { useCoreChat } from '../../../hooks'

export function InputView(props) {
  const { t } = useTranslation()
  const { draft, setDraft, send, sending } = useCoreChat({ chatId: props.chatId })
  const inputRef = React.useRef(null)

  // the disabled input can't take focus, so refocus after sending ends
  React.useEffect(() => {
    if (!sending) inputRef.current?.focus()
  }, [sending])

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: props.height,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          height: '100%',
          borderRadius: 2,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          paddingY: 1,
          paddingBottom: 1,
          paddingLeft: 2,
          paddingRight: 1,
        }}
      >
        <TextField
          multiline
          fullWidth
          variant="standard"
          inputRef={inputRef}
          disabled={sending}
          placeholder={t('main.t_placeholder')}
          value={draft}
          onChange={event => setDraft(event.target.value)}
          sx={{ height: '100%' }}
          slotProps={{
            input: {
              disableUnderline: true,
              sx: { height: '100%', alignItems: 'flex-start' },
            },
            htmlInput: {
              className: 'ScrollArea',
              sx: { height: '100% !important', overflowY: 'auto !important' },
              autoComplete: 'off',
              autoCorrect: 'off',
              autoCapitalize: 'off',
              spellCheck: false,
              onKeyDown: event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  send()
                }
              },
            },
          }}
        />
      </Box>

      <Box
        sx={{
          paddingTop: '6px',
        }}
      >
        <IconButton color="primary" size="small" onClick={send} disabled={sending}>
          {sending ? (
            <CircularProgress size={24} color={'inherit'} />
          ) : (
            <Send sx={{ fontSize: 24 }} />
          )}
        </IconButton>
      </Box>
    </Stack>
  )
}

InputView.propTypes = {
  height: PropTypes.number.isRequired,
  chatId: PropTypes.number,
}
