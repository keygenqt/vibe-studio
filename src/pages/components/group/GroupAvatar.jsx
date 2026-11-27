/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The group avatar: the stored icon or the first letter, the color scheme resolved by theme.
 */
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material/styles'
import { Box } from '@mui/material'

import { ACCENT_COLORS } from '../../../theme'
import { GROUP_ICONS } from './icons'

export function GroupAvatar(props) {
  const theme = useTheme()

  // a known scheme resolves by mode; the accent default and an
  // unknown key both fall back to the theme secondary pair
  const scheme = ACCENT_COLORS[props.color]?.[theme.palette.mode]
  const bgcolor = scheme?.secondary.main ?? theme.palette.secondary.main
  const fgcolor = scheme?.secondary.contrastText ?? theme.palette.secondary.contrastText
  const Icon = GROUP_ICONS[props.icon]?.Icon

  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: props.active ? 40 : 44,
          height: props.active ? 40 : 44,
          borderRadius: '50%',
          bgcolor,
          color: fgcolor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& .MuiSvgIcon-root': {
            fontSize: 20,
            color: fgcolor,
          },
          ...(props.active && {
            outline: '2px solid',
            outlineColor: bgcolor,
            outlineOffset: '2px',
          }),
        }}
      >
        {Icon ? (
          <Icon />
        ) : (
          <Box component={'span'} sx={{ fontSize: 20 }}>
            {props.name.charAt(0).toUpperCase()}
          </Box>
        )}
      </Box>
    </Box>
  )
}

GroupAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.string,
  color: PropTypes.string,
  active: PropTypes.bool,
}
