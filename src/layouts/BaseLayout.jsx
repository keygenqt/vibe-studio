/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

export function BaseLayout(props) {
  return (
    <Box height={1} boxSizing={'border-box'} sx={{ p: `0 10px 10px` }}>
      {props.children}
    </Box>
  )
}

BaseLayout.propTypes = { children: PropTypes.element.isRequired }
