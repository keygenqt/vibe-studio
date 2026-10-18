/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import { IconButton } from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router'

export function ActionBack(props) {
  const navigate = useNavigate()
  return (
    <IconButton disabled={props.disabled} onClick={() => navigate(-1)}>
      <ArrowBack />
    </IconButton>
  )
}
