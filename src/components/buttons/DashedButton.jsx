/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Button } from '@mui/material'
import Add from '@mui/icons-material/Add'

export function DashedButton(props) {
  const { icon = <Add /> } = props
  return (
    <Button
      fullWidth
      color={'primary'}
      variant={'outlined'}
      startIcon={icon}
      onClick={props.onClick}
      sx={{
        borderStyle: 'dashed',
        py: 2,
        borderRadius: 2,
        flexShrink: 0,
        color: 'text.primary',
        borderColor: 'divider',
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      {props.children}
    </Button>
  )
}

DashedButton.propTypes = {
  icon: PropTypes.element,
  onClick: PropTypes.func,
  children: PropTypes.node,
}
