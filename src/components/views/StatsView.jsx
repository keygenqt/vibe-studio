/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The chat usage stats: token breakdown by artifact and the speed.
 */
import PropTypes from 'prop-types'
import { Stack, Tooltip, Typography } from '@mui/material'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import AttachFile from '@mui/icons-material/AttachFile'
import AutoAwesome from '@mui/icons-material/AutoAwesome'
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline'
import Forum from '@mui/icons-material/Forum'
import Compress from '@mui/icons-material/Compress'
import Psychology from '@mui/icons-material/Psychology'
import Speed from '@mui/icons-material/Speed'
import Translate from '@mui/icons-material/Translate'
import { useTranslation } from 'react-i18next'

import { AppUtils } from '../../utils'

// the stats icons mirror the bubble actions: white on the dark tooltip
const ICON_SX = { fontSize: 14, color: 'common.white' }

// the compact line keeps the essentials; the full breakdown with
// the icons lives in the hover tooltip
const compactOf = (stats, t) =>
  [
    stats.tokens_input > 0 && `↓ ${AppUtils.human(stats.tokens_input)}`,
    stats.tokens_answer > 0 && `↑ ${AppUtils.human(stats.tokens_answer)}`,
    stats.tokens_thinking > 0 &&
      `${AppUtils.human(stats.tokens_thinking)} ${t('chat.t_stats_thinking')}`,
    stats.tokens_per_second > 0 && `${AppUtils.human(stats.tokens_per_second)} t/s`,
  ]
    .filter(Boolean)
    .join(' · ')

export function StatsView(props) {
  const { t } = useTranslation()
  const stats = props.stats
  if (!stats) return null
  const compact = compactOf(stats, t)
  if (!compact) return null
  const parts = [
    stats.tokens_input != null && {
      key: 'input',
      icon: <ArrowDownward sx={ICON_SX} />,
      label: t('chat.t_stats_input'),
      value: AppUtils.human(stats.tokens_input),
    },
    stats.tokens_input_breakdown != null && {
      key: 'input-user',
      label: t('chat.t_stats_input_user'),
      value: AppUtils.human(stats.tokens_input_breakdown[0]),
    },
    stats.tokens_input_breakdown != null && {
      key: 'input-system',
      label: t('chat.t_stats_input_system'),
      value: AppUtils.human(stats.tokens_input_breakdown[1]),
    },
    stats.tokens_input_breakdown != null && {
      key: 'input-history',
      label: t('chat.t_stats_input_history'),
      value: AppUtils.human(stats.tokens_input_breakdown[2]),
    },
    stats.tokens_per_second != null && {
      key: 'speed',
      icon: <Speed sx={ICON_SX} />,
      label: t('chat.t_stats_speed'),
      value: `${AppUtils.human(stats.tokens_per_second)} t/s`,
    },
    {
      key: 'answer',
      icon: <ChatBubbleOutline sx={ICON_SX} />,
      label: t('chat.t_stats_answer'),
      value: AppUtils.human(stats.tokens_answer),
    },
    {
      key: 'messages',
      icon: <Forum sx={ICON_SX} />,
      label: t('chat.t_stats_messages'),
      value: AppUtils.human(stats.messages),
    },
    {
      key: 'thinking',
      icon: <Psychology sx={ICON_SX} />,
      label: t('chat.t_stats_thinking'),
      value: AppUtils.human(stats.tokens_thinking),
    },
    {
      key: 'summary',
      icon: <AutoAwesome sx={ICON_SX} />,
      label: t('chat.t_stats_summary'),
      value: AppUtils.human(stats.tokens_summary),
    },
    {
      key: 'compress',
      icon: <Compress sx={ICON_SX} />,
      label: t('chat.t_stats_compress'),
      value: AppUtils.human(stats.tokens_compress),
    },
    {
      key: 'translate',
      icon: <Translate sx={ICON_SX} />,
      label: t('chat.t_stats_translate'),
      value: AppUtils.human(stats.tokens_translate),
    },
    {
      key: 'attachments',
      icon: <AttachFile sx={ICON_SX} />,
      label: t('chat.t_stats_attachments'),
      value: AppUtils.humanBytes(stats.attachments_bytes),
    },
  ]

  return (
    <Tooltip
      arrow
      placement={'top'}
      slotProps={{
        popper: {
          modifiers: [
            { name: 'offset', options: { offset: [0, 4] } },
            { name: 'preventOverflow', options: { padding: 8 } },
          ],
        },
      }}
      title={
        <Stack spacing={0.5} sx={{ minWidth: 200, py: 0.5 }}>
          {parts.filter(Boolean).map(part => (
            <Stack key={part.key} direction={'row'} spacing={1} alignItems={'center'}>
              {part.icon}
              <Typography variant={'caption'} sx={{ opacity: 0.7 }}>
                {part.label}
              </Typography>
              <Typography variant={'caption'} sx={{ ml: 'auto' }}>
                {part.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      }
    >
      <Typography variant={'caption'} noWrap color={'text.secondary'} sx={{ minWidth: 0 }}>
        {compact}
      </Typography>
    </Tooltip>
  )
}

StatsView.propTypes = {
  // the chat usage stats from Rust: the breakdown and the speed
  stats: PropTypes.shape({
    tokens_answer: PropTypes.number,
    tokens_thinking: PropTypes.number,
    tokens_translate: PropTypes.number,
    tokens_summary: PropTypes.number,
    tokens_compress: PropTypes.number,
    tokens_input: PropTypes.number,
    tokens_input_breakdown: PropTypes.arrayOf(PropTypes.number),
    tokens_per_second: PropTypes.number,
    messages: PropTypes.number,
    attachments_bytes: PropTypes.number,
  }),
}
