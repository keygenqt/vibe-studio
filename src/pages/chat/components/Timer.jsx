/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The elapsed timer: the m:ss count from the mount, one tick per second.
 */
import * as React from 'react'
import { Typography } from '@mui/material'

export function Timer() {
  const startedAt = React.useRef(Date.now())
  const [elapsed, setElapsed] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => setElapsed(Date.now() - startedAt.current), 1000)
    return () => clearInterval(timer)
  }, [])

  const minutes = Math.floor(elapsed / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)

  return (
    <Typography
      variant={'caption'}
      color={'text.secondary'}
      sx={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
    </Typography>
  )
}
