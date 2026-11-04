/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The model message bubble: one view at a time — answer, translation, summary, thinking.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import UnfoldLess from '@mui/icons-material/UnfoldLess'
import UnfoldMore from '@mui/icons-material/UnfoldMore'

import { ErrorSnackbar } from '../../../components/snackbars'
import { DeferredMarkdown } from './DeferredMarkdown'
import { Methods } from '../../../modules'
import { CHAT_COLLAPSE_HEIGHT } from '../../../constants'

import { MessageActions } from './MessageActions'

export function ModelMessageView(props) {
  const { t } = useTranslation()
  const message = props.message
  const isCancelled = message.status === 'cancelled'
  const isError = message.status === 'error'
  // the growing answer paints only the thinking switch: the text is
  // not final, the artifacts are not generated
  const isProgress = message.status === 'progress'
  // the view toggles live only on a finished answer
  const isFinal = message.status === 'complete'
  const [error, setError] = React.useState(null)
  // error and cancelled answers always render as text — the broken
  // bubble keeps its raw content whatever the stored view is
  const showType = isCancelled || isError ? 'text' : message.show_type

  // the copy takes the shown view: the active artifact, not the
  // original text
  const shownText =
    showType === 'translate'
      ? props.translation
      : showType === 'summary'
        ? message.summary
        : showType === 'thinking'
          ? message.thinking
          : message.text

  // the handler resolves `true` on success for the accent paint;
  // a failure lands in the snackbar
  const onClickCopy = async () => {
    try {
      await Methods.clipboard_write_text(shownText)
      return true
    } catch (err) {
      setError(t(String(err)))
      return false
    }
  }

  // the view switch persists the show type; switching to translate
  // generates an empty column — the cache lives on the Rust side
  const onClickTranslate = async () => {
    const next = showType === 'translate' ? 'text' : 'translate'
    try {
      await props.onShowType(message.id, next)
      if (next === 'translate') await props.onTranslate(message.id)
    } catch (err) {
      setError(t(String(err)))
    }
  }

  // the view switch persists the show type; the summary of an empty
  // column is spawned by the command itself
  const onClickSummary = async () => {
    try {
      await props.onShowType(message.id, showType === 'summary' ? 'text' : 'summary')
    } catch (err) {
      setError(t(String(err)))
    }
  }

  // the view switch persists the show type
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
            backgroundColor: isError ? 'error.main' : 'panel.main',
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
              {isFinal && props.onSetCollapsed && (
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
                color={isError ? 'error.contrastText' : 'text.secondary'}
                sx={{ minWidth: 0 }}
              >
                {[message.author, message.time].filter(Boolean).join(' · ')}
              </Typography>
            </Stack>
            {(isFinal || isCancelled || (isProgress && message.thinking)) && (
              <MessageActions
                onClickCopy={!isProgress && shownText ? onClickCopy : undefined}
                onClickTranslate={
                  !message.collapsed && isFinal && props.onTranslate && props.onShowType
                    ? onClickTranslate
                    : undefined
                }
                translateActive={showType === 'translate'}
                onClickSummary={
                  !message.collapsed && isFinal && props.canSummarize ? onClickSummary : undefined
                }
                summaryActive={showType === 'summary'}
                onClickThinking={
                  !message.collapsed && message.thinking && props.onShowType
                    ? onClickThinking
                    : undefined
                }
                thinkingActive={showType === 'thinking'}
                onClickDelete={!isProgress ? props.onDelete : undefined}
              />
            )}
          </Stack>
          <Box
            onClick={message.collapsed ? onClickCollapse : undefined}
            sx={
              message.collapsed
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
            {showType === 'summary' ? (
              <Typography
                variant={'body2'}
                color={'text.secondary'}
                sx={{ whiteSpace: 'pre-line', fontSize: props.fontSize }}
              >
                {message.summary ?? t('chat.t_summarizing')}
              </Typography>
            ) : showType === 'translate' ? (
              props.translation ? (
                <DeferredMarkdown
                  text={props.translation}
                  fontSize={props.fontSize}
                  immediate={props.immediate}
                />
              ) : (
                <Typography variant={'body2'} color={'text.secondary'}>
                  {t('chat.t_translating')}
                </Typography>
              )
            ) : showType === 'thinking' ? (
              <Typography
                variant={'body2'}
                color={'text.secondary'}
                sx={{ whiteSpace: 'pre-line', fontSize: props.fontSize }}
              >
                {message.thinking}
              </Typography>
            ) : isCancelled ? (
              <>
                <Typography variant={'body2'} color={'text.secondary'}>
                  {t('chat.t_cancelled')}
                </Typography>
                {message.text && (
                  <Typography
                    variant={'body2'}
                    color={'text.secondary'}
                    sx={{ fontStyle: 'italic', whiteSpace: 'pre-line' }}
                  >
                    {message.text}
                  </Typography>
                )}
              </>
            ) : message.text ? (
              <DeferredMarkdown
                text={message.text}
                fontSize={props.fontSize}
                immediate={props.immediate}
              />
            ) : (
              <Typography variant={'body2'} color={'text.secondary'}>
                {/* the growing answer shows the placeholder until the first text */}
                {message.status === 'progress' ? t('chat.t_generating') : t('chat.t_empty_answer')}
              </Typography>
            )}
          </Box>
        </Box>
      </Stack>
      <ErrorSnackbar text={error} onClose={() => setError(null)} />
    </>
  )
}

ModelMessageView.propTypes = {
  message: PropTypes.shape({
    author: PropTypes.string,
    time: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['complete', 'progress', 'cancelled', 'error']).isRequired,
    // which artifact the bubble shows
    show_type: PropTypes.oneOf(['text', 'translate', 'summary', 'thinking']).isRequired,
    text: PropTypes.string.isRequired,
    thinking: PropTypes.string,
    summary: PropTypes.string,
    collapsed: PropTypes.bool,
  }).isRequired,
  // the message text size in px
  fontSize: PropTypes.number.isRequired,
  // the shown translation: live while streaming, stored otherwise
  translation: PropTypes.string,
  // a translation request is running for this message
  translating: PropTypes.bool,
  // switches to the translate view and generates an empty column;
  // undefined hides the action — the translation model is not set
  onTranslate: PropTypes.func,
  // persists the show type of the bubble
  onShowType: PropTypes.func,
  // persists the collapsed flag of the bubble
  onSetCollapsed: PropTypes.func,
  // the light task model is set — the summary switch is available
  canSummarize: PropTypes.bool,
  // opens the delete confirmation: the message and everything below
  onDelete: PropTypes.func.isRequired,
  // the visible tail renders markdown without the lazy upgrade
  immediate: PropTypes.bool,
}
