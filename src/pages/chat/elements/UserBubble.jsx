/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The user message bubble: the tinted accent card with actions.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Stack, Typography } from '@mui/material'
import Refresh from '@mui/icons-material/Refresh'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import AutoAwesome from '@mui/icons-material/AutoAwesome'

import { AttachmentChip, MessageBubble } from '../components'
import { AppMethod, UiMethod } from '../../../core'
import { AppUtils } from '../../../utils'

export function UserBubble(props) {
  const { t } = useTranslation()

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

  // the view switch persists the show type; the summary of an empty
  // column is spawned by the command itself
  const onClickSummary = async () => {
    try {
      await props.onShowType(
        props.message.id,
        props.message.showType === 'summary' ? 'text' : 'summary'
      )
    } catch (err) {
      UiMethod.showError(t(String(err)))
    }
  }

  // the collapse persists the flag; the clamped content unfolds on click
  const onClickCollapse = async () => {
    try {
      await props.onSetCollapsed(props.message.id, !props.message.collapsed)
    } catch (err) {
      UiMethod.showError(t(String(err)))
    }
  }

  // the copy takes the shown view: the summary or the text itself
  const shownText =
    props.message.showType === 'summary' ? props.message.summary : props.message.text

  return (
    <MessageBubble
      tone={theme => AppUtils.mix(theme.palette.primary.main, theme.palette.background.paper, 0.15)}
      caption={[props.message.author, props.message.time].join(' · ')}
      collapsed={props.message.collapsed}
      onToggleCollapse={props.onSetCollapsed ? onClickCollapse : undefined}
      onCopy={shownText ? onClickCopy : undefined}
      primary={[
        { key: 'refresh', Icon: Refresh, onClick: props.onRefresh },
        { key: 'delete', Icon: DeleteOutline, onClick: props.onDelete },
      ]}
      toggles={
        props.canSummarize && !props.message.collapsed
          ? [
              {
                key: 'summary',
                Icon: AutoAwesome,
                size: 16,
                onClick: onClickSummary,
                active: props.message.showType === 'summary',
              },
            ]
          : []
      }
    >
      {props.message.showType === 'summary' ? (
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
      {props.message.attachments?.length > 0 && (
        <Stack
          direction={'row'}
          spacing={1}
          useFlexGap
          sx={{ flexWrap: 'wrap', pt: props.message.text ? 2 : 0 }}
        >
          {props.message.attachments.map(attachment => (
            <AttachmentChip key={attachment.id} attachment={attachment} />
          ))}
        </Stack>
      )}
    </MessageBubble>
  )
}

UserBubble.propTypes = {
  message: PropTypes.shape({
    author: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    // which artifact the bubble shows
    showType: PropTypes.oneOf(['text', 'translate', 'summary', 'thinking']).isRequired,
    text: PropTypes.string.isRequired,
    summary: PropTypes.string,
    collapsed: PropTypes.bool,
    // the file attachments: the metadata from the store
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string.isRequired,
        mime: PropTypes.string,
        size: PropTypes.number,
      })
    ),
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
