/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Box } from '@mui/material'

import { BaseLayout } from './BaseLayout'

export function ShellLayout(props) {
  return (
    <BaseLayout>
      <Box height={1} sx={{ display: 'flex', gap: 1 }}>
        <Box sx={{ flexShrink: 0, height: 1 }}>{props.rail}</Box>
        {props.children}
      </Box>
    </BaseLayout>
  )
}

ShellLayout.propTypes = {
  rail: PropTypes.element,
  children: PropTypes.node,
}
