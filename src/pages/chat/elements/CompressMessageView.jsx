/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The compress bubble: the base message with thinking, copy and delete.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import UnfoldLess from '@mui/icons-material/UnfoldLess'
import UnfoldMore from '@mui/icons-material/UnfoldMore'

import { ErrorSnackbar } from '../../../components/snackbars'
import { Methods } from '../../../modules'
import { AppUtils } from '../../../utils'
import { CHAT_COLLAPSE_HEIGHT } from '../../../constants'

import { DeferredMarkdown } from './DeferredMarkdown'
import { MessageActions } from './MessageActions'

export function CompressMessageView(props) {
  const { t } = useTranslation()
  const message = props.message
  // the attempt paints its growth, the final paints the base
  const isProgress = message.status === 'progress'
  const showType = message.show_type
  const [error, setError] = React.useState(null)

  // the caption is fixed: the base is the context, not a speaker
  const caption = [t('chat.t_compress_author'), message.time].join(' · ')

  // the copy takes the shown view: the thinking or the base
  const shownText = showType === 'thinking' ? message.thinking : message.text

  // resolves `true` on success for the copy accent; a failure lands
  // in the snackbar
  const onClickCopy = async () => {
    try {
      await Methods.clipboard_write_text(shownText)
      return true
    } catch (err) {
      setError(t(String(err)))
      return false
    }
  }

  // the view switch persists the show type — the thinking rides the
  // live stream as well
  const onClickThinking = async () => {
    try {
      await props.onShowType(message.id, showType === 'thinking' ? 'text' : 'thinking')
    } catch (err) {
      setError(t(String(err)))
    }
  }

  // the collapse persists the flag; the clamped content unfolds on click
  const onClickCollapse = async () => {
    try {
      await props.onSetCollapsed(message.id, !message.collapsed)
    } catch (err) {
      setError(t(String(err)))
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
            backgroundColor: 'panel.main',
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
              {!isProgress && props.onSetCollapsed && (
                <IconButton
                  size={'small'}
                  onClick={onClickCollapse}
                  sx={{ position: 'relative', left: '-4px' }}
                >
                  {message.collapsed ? (
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
                {caption}
              </Typography>
            </Stack>
            <MessageActions
              onClickCopy={!isProgress && shownText ? onClickCopy : undefined}
              onClickThinking={
                !message.collapsed && message.thinking && props.onShowType
                  ? onClickThinking
                  : undefined
              }
              thinkingActive={showType === 'thinking'}
              // the running attempt is not deletable: the Stop button
              // in the composer cuts the run
              onClickDelete={!isProgress ? props.onDelete : undefined}
            />
          </Stack>
          <Box
            onClick={message.collapsed ? onClickCollapse : undefined}
            sx={theme =>
              message.collapsed
                ? {
                    maxHeight: CHAT_COLLAPSE_HEIGHT,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      background: `linear-gradient(0deg, ${theme.palette.panel.main} 0%, rgba(0, 0, 0, 0) 100%)`,
                    },
                  }
                : undefined
            }
          >
            {showType === 'thinking' && !message.collapsed ? (
              <Typography
                variant={'body2'}
                color={'text.secondary'}
                sx={{ whiteSpace: 'pre-line', fontSize: props.fontSize }}
              >
                {message.thinking}
              </Typography>
            ) : isProgress && !message.text ? (
              <Typography variant={'body2'} color={'text.secondary'}>
                {t('chat.t_compressing')}
              </Typography>
            ) : (
              <DeferredMarkdown
                text={message.text}
                fontSize={props.fontSize}
                immediate={props.immediate}
              />
            )}
          </Box>
        </Box>
      </Stack>
      <ErrorSnackbar text={error} onClose={() => setError(null)} />
    </>
  )
}

CompressMessageView.propTypes = {
  message: PropTypes.shape({
    time: PropTypes.string.isRequired,
    // the attempt paints its growth while running
    status: PropTypes.oneOf(['complete', 'progress', 'cancelled', 'error']).isRequired,
    // the attempt shows the thinking on the toggle
    show_type: PropTypes.oneOf(['text', 'thinking']).isRequired,
    text: PropTypes.string.isRequired,
    thinking: PropTypes.string,
    // the collapse flag of the bubble
    collapsed: PropTypes.bool,
  }).isRequired,
  // the message text size in px
  fontSize: PropTypes.number.isRequired,
  // the visible attempt renders markdown without the lazy upgrade
  immediate: PropTypes.bool,
  // opens the delete confirmation
  onDelete: PropTypes.func.isRequired,
  // persists the show type — the thinking toggle
  onShowType: PropTypes.func,
  // persists the collapsed flag of the bubble
  onSetCollapsed: PropTypes.func,
}
