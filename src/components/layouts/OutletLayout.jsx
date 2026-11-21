/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The outlet gate: the load error paints over the loader, the ready one renders children.
 */
import PropTypes from 'prop-types'
import { Stack } from '@mui/material'

import { ErrorState } from '../states'
import { LoaderView } from '../views'
import { LOADER_FADE_MS } from '../../constants'

export function OutletLayout(props) {
  // the error paints over the loader: a failed load is never hidden
  if (props.error) {
    return <ErrorState text={props.error} />
  }
  if (!props.ready) {
    return (
      <Stack height={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <LoaderView delay={LOADER_FADE_MS} />
      </Stack>
    )
  }
  return props.children
}

OutletLayout.propTypes = {
  ready: PropTypes.bool.isRequired,
  error: PropTypes.string,
  children: PropTypes.node,
}
