/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The user message bubble: the tinted accent card with actions.
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

import { ErrorSnackbar } from '../../../components/snackbars'
import { Methods } from '../../../modules'

import { MessageActions } from './MessageActions'

export function UserMessageView(props) {
  const { t } = useTranslation()
  const [error, setError] = React.useState(null)

  // resolves `true` on success for the copy accent; a failure
  // lands in the snackbar
  const onClickCopy = async () => {
    try {
      await Methods.clipboard_write_text(props.message.text)
      return true
    } catch (err) {
      setError(t(String(err)))
      return false
    }
  }

  return (
    <>
      <Stack spacing={1}>
        <Box
          sx={{
            paddingX: 1.5,
            paddingY: 1,
            borderRadius: 2,
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.15),
          }}
        >
          <Stack
            direction={'row'}
            spacing={1}
            alignItems={'center'}
            justifyContent={'space-between'}
            sx={{ pb: 0.5 }}
          >
            <Typography
              variant={'caption'}
              noWrap
              color={'text.primary'}
              sx={{ opacity: 0.8, minWidth: 0 }}
            >
              {[props.message.author, props.message.time].join(' · ')}
            </Typography>
            <MessageActions
              onClickCopy={onClickCopy}
              onClickRefresh={props.onRefresh}
              onClickDelete={props.onDelete}
            />
          </Stack>
          <Typography variant={'body2'} color={'text.primary'} sx={{ whiteSpace: 'pre-line' }}>
            {props.message.text}
          </Typography>
        </Box>
      </Stack>
      <ErrorSnackbar text={error} onClose={() => setError(null)} />
    </>
  )
}

UserMessageView.propTypes = {
  message: PropTypes.shape({
    author: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
  // opens the resend confirmation: everything below goes away
  onRefresh: PropTypes.func.isRequired,
  // opens the delete confirmation: the message and everything below
  onDelete: PropTypes.func.isRequired,
}
