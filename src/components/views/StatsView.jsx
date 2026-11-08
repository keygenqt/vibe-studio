/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The chat usage stats: token breakdown by artifact and the speed.
 */
import PropTypes from 'prop-types'
import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import ArrowDownward from '@mui/icons-material/ArrowDownward'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
import AttachFile from '@mui/icons-material/AttachFile'
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline'
import Forum from '@mui/icons-material/Forum'
import Speed from '@mui/icons-material/Speed'
import { useTranslation } from 'react-i18next'

import { AppUtils } from '../../utils'
import { TooltipView } from './TooltipView'

// the stats icons sit on the themed tooltip bubble
const ICON_SX = { fontSize: 14, color: 'text.secondary' }
// the compact line icons replace the arrow characters
const COMPACT_ICON_SX = { fontSize: 13 }

export function StatsView(props) {
  const { t } = useTranslation()
  const stats = props.stats
  if (!stats) return null
  // the compact line keeps the two token flows; the full breakdown
  // with the context limit lives in the hover tooltip
  const hasInput = stats.tokens_input > 0
  const hasAnswer = stats.tokens_answer > 0
  if (!hasInput && !hasAnswer) return null

  const breakdown = stats.tokens_input_breakdown
  const limit = props.contextLimit != null ? props.contextLimit * 1000 : null
  // the footer sums the artifacts: summary, compress and translate
  const artifacts =
    (stats.tokens_summary ?? 0) + (stats.tokens_compress ?? 0) + (stats.tokens_translate ?? 0)

  // the indented sub-row of a section
  const subRow = (key, label, value) => (
    <Stack key={key} direction={'row'} spacing={1} alignItems={'center'}>
      <Typography variant={'caption'} color={'text.secondary'} noWrap>
        {label}
      </Typography>
      <Typography variant={'caption'} sx={{ ml: 'auto' }}>
        {value}
      </Typography>
    </Stack>
  )

  // the section header with the icon and the indented sub-rows
  const section = (icon, label, value, subs) => (
    <Box>
      <Stack direction={'row'} spacing={1} alignItems={'center'}>
        {icon}
        <Typography variant={'caption'}>{label}</Typography>
        <Typography variant={'caption'} sx={{ ml: 'auto' }}>
          {value}
        </Typography>
      </Stack>
      {subs.length > 0 && (
        <Stack spacing={0.25} sx={{ pl: '22px', pt: 0.25 }}>
          {subs}
        </Stack>
      )}
    </Box>
  )

  return (
    <TooltipView
      title={
        <Stack spacing={1} sx={{ minWidth: 220, py: 0.5 }}>
          {limit != null && (
            <Box>
              <Stack direction={'row'} spacing={1} alignItems={'center'}>
                <Typography variant={'caption'} color={'text.secondary'}>
                  {t('chat.t_stats_context')}
                </Typography>
                <Typography variant={'caption'} sx={{ ml: 'auto' }}>
                  {AppUtils.human(stats.tokens_input ?? 0)} / {AppUtils.human(limit)}
                </Typography>
              </Stack>
              <LinearProgress
                variant={'determinate'}
                color={stats.tokens_input > limit ? 'error' : 'primary'}
                value={Math.min(100, ((stats.tokens_input ?? 0) / limit) * 100)}
                sx={{ mt: 0.5, height: 4, borderRadius: 1 }}
              />
            </Box>
          )}
          {section(
            <ArrowDownward sx={ICON_SX} />,
            t('chat.t_stats_input'),
            AppUtils.human(stats.tokens_input ?? 0),
            breakdown != null
              ? [
                  subRow('history', t('chat.t_stats_input_history'), AppUtils.human(breakdown[2])),
                  subRow('user', t('chat.t_stats_input_user'), AppUtils.human(breakdown[0])),
                  subRow('system', t('chat.t_stats_input_system'), AppUtils.human(breakdown[1])),
                ]
              : []
          )}
          {section(
            <ChatBubbleOutline sx={ICON_SX} />,
            t('chat.t_stats_answer'),
            AppUtils.human(stats.tokens_answer),
            [subRow('thinking', t('chat.t_stats_thinking'), AppUtils.human(stats.tokens_thinking))]
          )}
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <Speed sx={ICON_SX} />
            <Typography variant={'caption'} color={'text.secondary'}>
              {t('chat.t_stats_speed')}
            </Typography>
            <Typography variant={'caption'} sx={{ ml: 'auto' }}>
              {AppUtils.human(stats.tokens_per_second)} t/s
            </Typography>
          </Stack>
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <Forum sx={ICON_SX} />
            <Typography variant={'caption'} color={'text.secondary'}>
              {t('chat.t_stats_messages')}
            </Typography>
            <Typography variant={'caption'} sx={{ ml: 'auto' }}>
              {AppUtils.human(stats.messages)}
            </Typography>
          </Stack>
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <AttachFile sx={ICON_SX} />
            <Typography variant={'caption'} color={'text.secondary'}>
              {t('chat.t_stats_attachments')}
            </Typography>
            <Typography variant={'caption'} sx={{ ml: 'auto' }}>
              {AppUtils.humanBytes(stats.attachments_bytes)}
            </Typography>
          </Stack>
          <Stack
            direction={'row'}
            spacing={1}
            alignItems={'center'}
            sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant={'caption'} color={'text.secondary'} noWrap>
              {[
                t('chat.t_stats_summary'),
                t('chat.t_stats_compress'),
                t('chat.t_stats_translate'),
              ].join(', ')}
            </Typography>
            <Typography variant={'caption'} sx={{ ml: 'auto' }}>
              {AppUtils.human(artifacts)}
            </Typography>
          </Stack>
        </Stack>
      }
    >
      <Typography
        variant={'caption'}
        noWrap
        color={'text.secondary'}
        sx={{ minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
      >
        {hasInput && (
          <Box component={'span'} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <ArrowDownward sx={COMPACT_ICON_SX} />
            {AppUtils.human(stats.tokens_input)}
          </Box>
        )}
        {hasAnswer && (
          <Box component={'span'} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <ArrowUpward sx={COMPACT_ICON_SX} />
            {AppUtils.human(stats.tokens_answer)}
          </Box>
        )}
      </Typography>
    </TooltipView>
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
  // the context limit in thousands of tokens, from the settings
  contextLimit: PropTypes.number,
}
