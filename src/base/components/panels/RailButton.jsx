/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { IconButton, Tooltip } from '@mui/material'

export function RailButton(props) {
  return (
    <Tooltip title={props.title} placement="right">
      <IconButton size="small" onClick={props.onClick}>
        {props.children}
      </IconButton>
    </Tooltip>
  )
}

RailButton.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.element,
}
