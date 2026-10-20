/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { IconButton } from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router'

export function BackIconButton(props) {
  const navigate = useNavigate()
  return (
    <IconButton size="small" disabled={props.disabled} onClick={() => navigate(-1)}>
      <ArrowBack />
    </IconButton>
  )
}

BackIconButton.propTypes = {
  disabled: PropTypes.bool,
}
