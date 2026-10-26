/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { IconButton, Tooltip } from '@mui/material'

export function TooltipIconButton(props) {
  const { size = 'small' } = props
  // native sizes pass straight through; 'mini' has no native size — compact square override
  return (
    <Tooltip title={props.title} placement="right">
      <IconButton
        size={size === 'mini' ? 'small' : size}
        onClick={props.onClick}
        sx={
          size === 'mini'
            ? {
                width: 24,
                height: 24,
                padding: '2px',
                '& .MuiSvgIcon-root': { fontSize: 20 },
              }
            : undefined
        }
      >
        {props.children}
      </IconButton>
    </Tooltip>
  )
}

TooltipIconButton.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'mini']),
  children: PropTypes.element,
}
