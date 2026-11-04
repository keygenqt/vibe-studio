/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The chat usage stats: token breakdown by artifact and the speed.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { Stack, Typography } from '@mui/material'
import AutoAwesome from '@mui/icons-material/AutoAwesome'
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline'
import Psychology from '@mui/icons-material/Psychology'
import Speed from '@mui/icons-material/Speed'
import Translate from '@mui/icons-material/Translate'

import { AppUtils } from '../../utils'

// the stats icons mirror the bubble actions: one visual language
const ICON_SX = { fontSize: 14, color: 'text.secondary' }

// the narrow composer box hides the artifact tokens: the texts and
// the speed stay
const MINOR_QUERY = { '@container (max-width: 500px)': { display: 'none' } }

export function StatsView(props) {
  const stats = props.stats
  if (!stats) return null
  const parts = [
    stats.tokens_per_second > 0 && {
      key: 'speed',
      icon: <Speed sx={ICON_SX} />,
      value: `${AppUtils.human(stats.tokens_per_second)} t/s`,
    },
    stats.messages > 0 && {
      key: 'texts',
      icon: <ChatBubbleOutline sx={ICON_SX} />,
      value: `${AppUtils.human(stats.tokens_answer)} / ${stats.messages}`,
    },
    stats.tokens_thinking > 0 && {
      key: 'thinking',
      minor: true,
      icon: <Psychology sx={ICON_SX} />,
      value: AppUtils.human(stats.tokens_thinking),
    },
    stats.tokens_summary > 0 && {
      key: 'summary',
      minor: true,
      icon: <AutoAwesome sx={ICON_SX} />,
      value: AppUtils.human(stats.tokens_summary),
    },
    stats.tokens_translate > 0 && {
      key: 'translate',
      minor: true,
      icon: <Translate sx={ICON_SX} />,
      value: AppUtils.human(stats.tokens_translate),
    },
  ].filter(part => part !== false)

  return (
    <Stack
      direction={'row'}
      spacing={1}
      alignItems={'center'}
      sx={{ minWidth: 0, overflow: 'hidden', '& .stats-minor': MINOR_QUERY }}
    >
      {parts.map(part => (
        <Stack
          key={part.key}
          direction={'row'}
          spacing={0.25}
          alignItems={'center'}
          className={part.minor ? 'stats-minor' : undefined}
        >
          {part.icon}
          <Typography variant={'caption'} noWrap color={'text.secondary'}>
            {part.value}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

StatsView.propTypes = {
  // the chat usage stats from Rust: the breakdown and the speed
  stats: PropTypes.shape({
    tokens_answer: PropTypes.number,
    tokens_thinking: PropTypes.number,
    tokens_translate: PropTypes.number,
    tokens_summary: PropTypes.number,
    tokens_per_second: PropTypes.number,
    messages: PropTypes.number,
  }),
}
