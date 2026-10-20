/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import * as React from 'react'
import { CircularProgress, Stack } from '@mui/material'

export function LoadingState() {
  return (
    <Stack height={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress />
    </Stack>
  )
}
