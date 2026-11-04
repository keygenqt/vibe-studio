/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Content gate: loader until the page data is ready.
 */
import PropTypes from 'prop-types'
import { Stack } from '@mui/material'

import { LoaderView } from '../views'
import { LOADER_FADE_MS } from '../../constants'

export function WaitState(props) {
  if (props.ready) {
    return props.children
  }
  return (
    <Stack height={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <LoaderView delay={LOADER_FADE_MS} />
    </Stack>
  )
}

WaitState.propTypes = {
  ready: PropTypes.bool.isRequired,
  children: PropTypes.node,
}
