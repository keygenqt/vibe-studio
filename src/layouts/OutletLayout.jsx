/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The outlet gate: the load error paints over the loader, the ready one renders children.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { Box, Stack } from '@mui/material'
import { ErrorState, LoaderView } from './components'
import { LOADER_FADE_MS } from '../constants'

export const OutletLayout = React.forwardRef(function OutletLayout(props, ref) {
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
  // the ready root: a neutral box carrying the caller's ref and styles
  return (
    <Box ref={ref} sx={props.sx}>
      {props.children}
    </Box>
  )
})

OutletLayout.propTypes = {
  ready: PropTypes.bool.isRequired,
  error: PropTypes.string,
  sx: PropTypes.object,
  children: PropTypes.node,
}
