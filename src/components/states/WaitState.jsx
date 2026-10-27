/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import * as React from 'react'
import { useTheme, CircularProgress, Stack } from '@mui/material'

export function WaitState(props) {
  const theme = useTheme()
  const [minDone, setMinDone] = React.useState(props.ready)

  React.useEffect(() => {
    if (minDone) return undefined
    const timer = setTimeout(() => setMinDone(true), theme.transitions.duration.pageLoading)
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
