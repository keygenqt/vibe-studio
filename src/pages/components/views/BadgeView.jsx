/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Round icon badge with an active state.
 */
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

export function BadgeView(props) {
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
          bgcolor: props.active ? 'secondary.main' : 'secondary.light',
          color: props.active ? 'secondary.contrastText' : 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& .MuiSvgIcon-root': {
            fontSize: 20,
            color: props.active ? 'secondary.contrastText' : 'secondary.main',
          },
          ...(props.active && {
            outline: '2px solid',
            outlineColor: 'secondary.main',
            outlineOffset: '2px',
          }),
        }}
      >
        {props.children}
      </Box>
    </Box>
  )
}

BadgeView.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.node,
}
