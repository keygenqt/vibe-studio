/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The model message bubble: one view at a time — answer, translation, summary, thinking.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import Psychology from '@mui/icons-material/Psychology'
import AutoAwesome from '@mui/icons-material/AutoAwesome'
import Translate from '@mui/icons-material/Translate'

import { DeferredMarkdown } from './DeferredMarkdown'
import { MessageBubble } from '../components'
import { AppMethod, UiMethod } from '../../../core'

export function ModelBubble(props) {
  const { t } = useTranslation()
  const message = props.message
  const isCancelled = message.status === 'cancelled'
  const isError = message.status === 'error'
  // the growing answer paints only the thinking switch: the text is
  // not final, the artifacts are not generated
  const isProgress = message.status === 'progress'
  // the view toggles live only on a finished answer
  const isFinal = message.status === 'complete'
  // error and cancelled answers always render as text — the broken
  // bubble keeps its raw content whatever the stored view is
  const showType = isCancelled || isError ? 'text' : message.showType

  // the logic stays with the view: the shell owns presentation only
  const onClickCopy = async () => {
    try {
      await AppMethod.clipboardWriteText(shownText)
      return true
    } catch (err) {
      UiMethod.showError(t(String(err)))
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
      UiMethod.showError(t(String(err)))
    }
  }

  // the view switch persists the show type; the summary of an empty
  // column is spawned by the command itself
  const onClickSummary = async () => {
    try {
      await props.onShowType(message.id, showType === 'summary' ? 'text' : 'summary')
    } catch (err) {
      UiMethod.showError(t(String(err)))
    }
  }

  // the view switch persists the show type
  const onClickThinking = async () => {
    try {
      await props.onShowType(message.id, showType === 'thinking' ? 'text' : 'thinking')
    } catch (err) {
      UiMethod.showError(t(String(err)))
    }
  }

  // the collapse persists the flag; the clamped content unfolds on click
  const onClickCollapse = async () => {
    try {
      await props.onSetCollapsed(message.id, !message.collapsed)
    } catch (err) {
      UiMethod.showError(t(String(err)))
    }
  }

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

  // the toggle row: each entry carries its own availability gate
  const toggles = [
    !message.collapsed &&
      message.thinking &&
      props.onShowType && {
        key: 'thinking',
        Icon: Psychology,
        onClick: onClickThinking,
        active: showType === 'thinking',
      },
    !message.collapsed &&
      isFinal &&
      props.canSummarize && {
        key: 'summary',
        Icon: AutoAwesome,
        size: 16,
        onClick: onClickSummary,
        active: showType === 'summary',
      },
    !message.collapsed &&
      isFinal &&
      props.onTranslate &&
      props.onShowType && {
        key: 'translate',
        Icon: Translate,
        size: 16,
        onClick: onClickTranslate,
        active: showType === 'translate',
      },
  ].filter(Boolean)

  return (
    <MessageBubble
      tone={theme => (isError ? theme.palette.error.main : theme.palette.panel.main)}
      caption={[message.author, message.time].filter(Boolean).join(' · ')}
      captionColor={isError ? 'error.contrastText' : undefined}
      collapsed={message.collapsed}
      onToggleCollapse={isFinal && props.onSetCollapsed ? onClickCollapse : undefined}
      onCopy={!isProgress && shownText ? onClickCopy : undefined}
      primary={!isProgress ? [{ key: 'delete', Icon: DeleteOutline, onClick: props.onDelete }] : []}
      toggles={toggles}
    >
      {isError ? (
        <Typography variant={'body2'} color={'error.contrastText'}>
          {message.text}
        </Typography>
      ) : showType === 'summary' ? (
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
    </MessageBubble>
  )
}

ModelBubble.propTypes = {
  message: PropTypes.shape({
    author: PropTypes.string,
    time: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['complete', 'progress', 'cancelled', 'error']).isRequired,
    // which artifact the bubble shows
    showType: PropTypes.oneOf(['text', 'translate', 'summary', 'thinking']).isRequired,
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
