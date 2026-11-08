/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The capability badge row: input / output / ability groups with dividers.
 */
import { Fragment } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, Divider, Stack, Tooltip } from '@mui/material'
import ArticleOutlined from '@mui/icons-material/ArticleOutlined'
import BuildOutlined from '@mui/icons-material/BuildOutlined'
import HearingOutlined from '@mui/icons-material/HearingOutlined'
import ImageOutlined from '@mui/icons-material/ImageOutlined'
import MovieOutlined from '@mui/icons-material/MovieOutlined'
import PsychologyOutlined from '@mui/icons-material/PsychologyOutlined'
import TextFieldsOutlined from '@mui/icons-material/TextFieldsOutlined'
import VideocamOutlined from '@mui/icons-material/VideocamOutlined'
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'

// the badge groups of the capability matrix: input / output / abilities,
// separated by thin dividers like the message action bar
const GROUPS = [
  {
    key: 'output',
    color: 'warning.main',
    badges: [
      { key: 'output_text', icon: ArticleOutlined, label: 'models.t_badge_text_out' },
      { key: 'output_image', icon: ImageOutlined, label: 'models.t_badge_image_out' },
      { key: 'output_audio', icon: VolumeUpOutlined, label: 'models.t_badge_audio_out' },
      { key: 'output_video', icon: MovieOutlined, label: 'models.t_badge_video_out' },
    ],
  },
  {
    key: 'input',
    color: 'info.main',
    badges: [
      { key: 'input_text', icon: TextFieldsOutlined, label: 'models.t_badge_text_in' },
      { key: 'input_vision', icon: VisibilityOutlined, label: 'models.t_badge_vision' },
      { key: 'input_audio', icon: HearingOutlined, label: 'models.t_badge_audio_in' },
      { key: 'input_video', icon: VideocamOutlined, label: 'models.t_badge_video_in' },
    ],
  },
  {
    key: 'abilities',
    color: 'success.main',
    badges: [
      { key: 'tools', icon: BuildOutlined, label: 'models.t_badge_tools' },
      { key: 'thinking', icon: PsychologyOutlined, label: 'models.t_badge_thinking' },
    ],
  },
]

export function ModelCapability(props) {
  const { t } = useTranslation()

  // only true capabilities badge: closed-world, a miss stays silent;
  // the empty groups drop out, the dividers stay between the rest
  const groups = GROUPS.map(group => ({
    ...group,
    items: group.badges.filter(badge => props.capabilities?.[badge.key] === true),
  })).filter(group => group.items.length > 0)

  // the empty matrix paints nothing
  if (groups.length === 0) return null

  return (
    <Stack direction={'row'} spacing={0.75} alignItems={'center'} sx={{ flexShrink: 0 }}>
      {groups.map((group, index) => (
        <Fragment key={group.key}>
          {index > 0 && (
            <Divider orientation={'vertical'} flexItem sx={{ alignSelf: 'center', height: 14 }} />
          )}
          {group.items.map(badge => {
            const Icon = badge.icon
            return (
              <Tooltip key={badge.label} title={t(badge.label)}>
                <Box component={'span'} sx={{ display: 'inline-flex' }}>
                  <Icon sx={{ fontSize: 16, color: group.color }} />
                </Box>
              </Tooltip>
            )
          })}
        </Fragment>
      ))}
    </Stack>
  )
}

ModelCapability.propTypes = {
  capabilities: PropTypes.object,
}
