/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The model message bubble: thinking, the answer and the translation.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, Stack, Typography } from '@mui/material'

import { ErrorSnackbar } from '../../../components/snackbars'
import { DeferredMarkdown } from './DeferredMarkdown'
import { Methods } from '../../../modules'

import { MessageActions } from './MessageActions'

export function ModelMessageView(props) {
  const { t } = useTranslation()
  const [thinkingOpen, setThinkingOpen] = React.useState(false)
  // a stored translation shows itself: the column holds the shown one
  const [translationOpen, setTranslationOpen] = React.useState(Boolean(props.translation))
  const message = props.message
  const isCancelled = message.status === 'cancelled'
  const isError = message.status === 'error'
  const isCollapsed = Boolean(message.collapsed)
  const [error, setError] = React.useState(null)

  // the handler resolves `true` on success for the accent paint;
  // a failure lands in the snackbar
  const onClickCopy = async () => {
    try {
      await Methods.clipboard_write_text(message.text)
      return true
    } catch (err) {
      setError(t(String(err)))
      return false
    }
  }

  // the toggle flips the persisted flag; the summary lands through
  // the block event
  const onClickCollapse = async () => {
    try {
      await props.onCollapse(message.id, !message.collapsed)
    } catch (err) {
      setError(t(String(err)))
    }
  }

  // the toggle: open translates anew, close clears — the column
  // holds only the shown translation
  const onClickTranslate = async () => {
    if (translationOpen) {
      setTranslationOpen(false)
      try {
        await props.onTranslateClose(message.id)
      } catch (err) {
        setError(t(String(err)))
      }
      return
    }
    setTranslationOpen(true)
    try {
      await props.onTranslate(message.id)
    } catch (err) {
      setTranslationOpen(false)
      setError(t(String(err)))
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
            backgroundColor: isError ? 'error.main' : 'panel.main',
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
              color={isError ? 'error.contrastText' : 'text.secondary'}
              sx={{ minWidth: 0 }}
            >
              {[message.author, message.time].filter(Boolean).join(' · ')}
            </Typography>
            {!isCancelled && !isError && (
              <MessageActions
                onClickCopy={message.text ? onClickCopy : undefined}
                onClickCollapse={props.onCollapse ? onClickCollapse : undefined}
                collapseActive={isCollapsed}
                onClickTranslate={props.onTranslate ? onClickTranslate : undefined}
                onClickThinking={
                  message.thinking ? () => setThinkingOpen(!thinkingOpen) : undefined
                }
                translateActive={translationOpen}
                thinkingActive={thinkingOpen}
                onClickDelete={props.onDelete}
              />
            )}
          </Stack>
          {isCollapsed ? (
            <Typography
              variant={'body2'}
              color={'text.main'}
              sx={{ whiteSpace: 'pre-line', fontSize: props.fontSize }}
            >
              {message.summary ?? t('chat.t_summarizing')}
            </Typography>
          ) : (
            <>
              {message.thinking && thinkingOpen && !isCancelled && !isError && (
                <>
                  <Typography
                    variant={'body2'}
                    color={'text.secondary'}
                    sx={{ whiteSpace: 'pre-line', fontSize: props.fontSize }}
                  >
                    {message.thinking}
                  </Typography>
                  <Box sx={{ my: 1, borderTop: '1px dashed', borderColor: 'divider' }} />
                </>
              )}
              {isCancelled ? (
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
                  {message.status === 'progress'
                    ? t('chat.t_generating')
                    : t('chat.t_empty_answer')}
                </Typography>
              )}
              {(props.translation || props.translating) &&
                translationOpen &&
                !isCancelled &&
                !isError && (
                  <>
                    <Box sx={{ my: 1, borderTop: '1px dashed', borderColor: 'divider' }} />
                    {props.translation ? (
                      <DeferredMarkdown
                        text={props.translation}
                        fontSize={props.fontSize}
                        immediate={props.immediate}
                      />
                    ) : (
                      <Typography variant={'body2'} color={'text.secondary'}>
                        {t('chat.t_translating')}
                      </Typography>
                    )}
                  </>
                )}
            </>
          )}
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
    text: PropTypes.string.isRequired,
    thinking: PropTypes.string,
  }).isRequired,
  // the message text size in px
  fontSize: PropTypes.number.isRequired,
  // the shown translation: live while streaming, stored otherwise
  translation: PropTypes.string,
  // a translation request is running for this message
  translating: PropTypes.bool,
  // open translates anew, close clears; undefined hides the action —
  // the translation model is not set
  onTranslate: PropTypes.func,
  onTranslateClose: PropTypes.func,
  // opens the delete confirmation: the message and everything below
  onDelete: PropTypes.func.isRequired,
  // collapses the bubble: flips the persisted flag, the summary
  // arrives through the block event; undefined hides the action —
  // the light task model is not set
  onCollapse: PropTypes.func,
  // the visible tail renders markdown without the lazy upgrade
  immediate: PropTypes.bool,
}
