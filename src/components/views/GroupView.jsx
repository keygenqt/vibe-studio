/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Group shell: the caption and the outlined card of rows.
 */
import PropTypes from 'prop-types'
import { Card, Divider, Stack, Typography } from '@mui/material'

export function GroupView(props) {
  return (
    <Stack spacing={1}>
      <Typography
        variant={'body2'}
        color={'primary.main'}
        sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, pl: 0.5 }}
      >
        {props.title}
      </Typography>
      <Card variant={'outlined'} sx={{ borderRadius: 2 }}>
        <Stack divider={<Divider />}>{props.children}</Stack>
      </Card>
    </Stack>
  )
}

GroupView.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
}
