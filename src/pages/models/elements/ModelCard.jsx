/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { Card, Checkbox, Stack, Typography } from '@mui/material'

// selectable model row: toggled by its checkbox
export function ModelCard(props) {
  return (
    <Card variant={'outlined'} sx={{ borderRadius: 2 }}>
      <Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ py: 1, pr: 1, pl: 2 }}>
        <Typography noWrap sx={{ flexGrow: 1, minWidth: 0 }}>
          {props.name}
        </Typography>
        <Checkbox checked={props.checked} onChange={props.onToggle} />
      </Stack>
    </Card>
  )
}

ModelCard.propTypes = {
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onToggle: PropTypes.func,
}
