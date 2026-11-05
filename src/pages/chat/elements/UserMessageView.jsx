/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The user message bubble: the tinted accent card with actions.
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import UnfoldLess from '@mui/icons-material/UnfoldLess'
import UnfoldMore from '@mui/icons-material/UnfoldMore'
import { alpha } from '@mui/material/styles'

import { ErrorSnackbar } from '../../../components/snackbars'
import { Methods } from '../../../modules'
import { CHAT_COLLAPSE_HEIGHT } from '../../../constants'

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

  // the collapse persists the flag; the clamped content unfolds on click
  const onClickCollapse = async () => {
    try {
      await props.onSetCollapsed(props.message.id, !props.message.collapsed)
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
            sx={{ pb: 1 }}
          >
            <Stack direction={'row'} alignItems={'center'}>
              {props.onSetCollapsed && (
                <IconButton
                  size={'small'}
                  onClick={onClickCollapse}
                  sx={{ position: 'relative', left: '-4px' }}
                >
                  {props.message.collapsed ? (
                    <UnfoldMore sx={{ fontSize: 17, color: 'text.secondary' }} />
                  ) : (
                    <UnfoldLess sx={{ fontSize: 17, color: 'text.secondary' }} />
                  )}
                </IconButton>
              )}
              <Typography
                variant={'caption'}
                noWrap
                color={'text.secondary'}
                sx={{ minWidth: 0, paddingY: '4px' }}
              >
                {[props.message.author, props.message.time].join(' · ')}
              </Typography>
            </Stack>
            <MessageActions
              onClickCopy={shownText ? onClickCopy : undefined}
              onClickSummary={
                !props.message.collapsed && props.canSummarize ? onClickSummary : undefined
              }
              summaryActive={props.message.show_type === 'summary'}
              onClickRefresh={props.onRefresh}
              onClickDelete={props.onDelete}
            />
          </Stack>
          <Box
            onClick={props.message.collapsed ? onClickCollapse : undefined}
            sx={
              props.message.collapsed
                ? {
                    maxHeight: CHAT_COLLAPSE_HEIGHT,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    maskImage:
                      'linear-gradient(to bottom, #000 calc(100% - 32px), rgba(0,0,0,0.55) calc(100% - 20px), rgba(0,0,0,0.18) calc(100% - 8px), transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, #000 calc(100% - 32px), rgba(0,0,0,0.55) calc(100% - 20px), rgba(0,0,0,0.18) calc(100% - 8px), transparent 100%)',
                  }
                : undefined
            }
          >
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
    collapsed: PropTypes.bool,
  }).isRequired,
  // the message text size in px
  fontSize: PropTypes.number.isRequired,
  // opens the resend confirmation: everything below goes away
  onRefresh: PropTypes.func.isRequired,
  // opens the delete confirmation: the message and everything below
  onDelete: PropTypes.func.isRequired,
  // persists the show type of the bubble
  onShowType: PropTypes.func,
  // persists the collapsed flag of the bubble
  onSetCollapsed: PropTypes.func,
  // the light task model is set — the summary switch is available
  canSummarize: PropTypes.bool,
}
