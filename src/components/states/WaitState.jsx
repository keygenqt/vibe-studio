/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { CircularProgress, Stack } from '@mui/material'

// test knob: hold the loader on cold loads (cache miss) in ms, 0 = off
const DEBUG_LOADER_DELAY = 0

export function WaitState(props) {
  const [minDone, setMinDone] = React.useState(props.ready)

  React.useEffect(() => {
    if (minDone) return undefined
    const timer = setTimeout(() => setMinDone(true), DEBUG_LOADER_DELAY)
    return () => clearTimeout(timer)
  }, [])

  if (props.ready && minDone) {
    return props.children
  }
  return (
    <Stack height={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress />
    </Stack>
  )
}

WaitState.propTypes = {
  ready: PropTypes.bool.isRequired,
  children: PropTypes.node,
}
