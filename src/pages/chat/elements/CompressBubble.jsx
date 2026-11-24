/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The compress bubble: the base message with thinking, copy and delete.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import Psychology from '@mui/icons-material/Psychology'

import { MessageBubble } from '../components'
import { AppMethod, UiMethod } from '../../../core'

import { DeferredMarkdown } from './DeferredMarkdown'

export function CompressBubble(props) {
  const { t } = useTranslation()
  const message = props.message
  // the attempt paints its growth, the final paints the base
  const isProgress = message.status === 'progress'
  const showType = message.showType

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

  // the view switch persists the show type — the thinking rides the
  // live stream as well
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

  // the copy takes the shown view: the thinking or the base
  const shownText = showType === 'thinking' ? message.thinking : message.text
  // the caption is fixed: the base is the context, not a speaker
  const caption = [t('chat.t_compress_author'), message.time].join(' · ')

  return (
    <MessageBubble
      tone={theme => theme.palette.panel.main}
      caption={caption}
      collapsed={message.collapsed}
      onToggleCollapse={!isProgress && props.onSetCollapsed ? onClickCollapse : undefined}
      onCopy={!isProgress && shownText ? onClickCopy : undefined}
      primary={!isProgress ? [{ key: 'delete', Icon: DeleteOutline, onClick: props.onDelete }] : []}
      toggles={
        !message.collapsed && message.thinking && props.onShowType
          ? [
              {
                key: 'thinking',
                Icon: Psychology,
                onClick: onClickThinking,
                active: showType === 'thinking',
              },
            ]
          : []
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
    </MessageBubble>
  )
}

CompressBubble.propTypes = {
  message: PropTypes.shape({
    time: PropTypes.string.isRequired,
    // the attempt paints its growth while running
    status: PropTypes.oneOf(['complete', 'progress', 'cancelled', 'error']).isRequired,
    // the attempt shows the thinking on the toggle
    showType: PropTypes.oneOf(['text', 'thinking']).isRequired,
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
