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

  // the view switch persists the show type; the summary of an empty
  // column is spawned by the command itself
  const onClickSummary = async () => {
    try {
      await props.onShowType(
        props.message.id,
        props.message.show_type === 'summary' ? 'text' : 'summary'
      )
    } catch (err) {
      setError(t(String(err)))
    }
  }

  // the copy takes the shown view: the summary or the text itself
  const shownText =
    props.message.show_type === 'summary' ? props.message.summary : props.message.text

  // resolves `true` on success for the copy accent; a failure
  // lands in the snackbar
  const onClickCopy = async () => {
    try {
      await Methods.clipboard_write_text(shownText)
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
            paddingTop: 1,
            paddingBottom: 1.5,
            borderRadius: 2,
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.15),
          }}
        >
          <Stack
            direction={'row'}
            spacing={1}
            alignItems={'center'}
            justifyContent={'space-between'}
            sx={{
              minHeight: 24,
              pb: 1,
            }}
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
              onClickCopy={shownText ? onClickCopy : undefined}
              onClickSummary={props.canSummarize ? onClickSummary : undefined}
              summaryActive={props.message.show_type === 'summary'}
              onClickRefresh={props.onRefresh}
              onClickDelete={props.onDelete}
            />
          </Stack>
          {props.message.show_type === 'summary' ? (
            <Typography
              variant={'body2'}
              color={'text.secondary'}
              sx={{ whiteSpace: 'pre-line', fontSize: props.fontSize }}
            >
              {props.message.summary ?? t('chat.t_summarizing')}
            </Typography>
          ) : (
            <Typography
              variant={'body2'}
              color={'text.primary'}
              sx={{ whiteSpace: 'pre-line', fontSize: props.fontSize }}
            >
              {props.message.text}
            </Typography>
          )}
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
    // which artifact the bubble shows
    show_type: PropTypes.oneOf(['text', 'translate', 'summary', 'thinking']).isRequired,
    text: PropTypes.string.isRequired,
    summary: PropTypes.string,
  }).isRequired,
  // the message text size in px
  fontSize: PropTypes.number.isRequired,
  // opens the resend confirmation: everything below goes away
  onRefresh: PropTypes.func.isRequired,
  // opens the delete confirmation: the message and everything below
  onDelete: PropTypes.func.isRequired,
  // persists the show type of the bubble
  onShowType: PropTypes.func,
  // the light task model is set — the summary switch is available
  canSummarize: PropTypes.bool,
}
