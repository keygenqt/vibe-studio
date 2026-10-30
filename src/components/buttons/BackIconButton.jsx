/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Back arrow wired to the navigation journal.
 */
import PropTypes from 'prop-types'
import { IconButton } from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router'

import { AppNav } from '../../utils'

export function BackIconButton(props) {
  const navigate = useNavigate()
  return (
    <IconButton
      size="small"
      disabled={props.disabled}
      onClick={() => (props.to ? AppNav.backTo(navigate, props.to) : AppNav.back(navigate))}
    >
      <ArrowBack />
    </IconButton>
  )
}

BackIconButton.propTypes = {
  disabled: PropTypes.bool,
  to: PropTypes.string,
}
