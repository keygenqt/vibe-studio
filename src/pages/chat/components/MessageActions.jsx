/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The message action bar: primary and toggle rows built from item data.
 */
import PropTypes from 'prop-types'
import { Divider, IconButton, Stack } from '@mui/material'

const ITEM_SHAPE = {
  key: PropTypes.string.isRequired,
  Icon: PropTypes.elementType.isRequired,
  size: PropTypes.number,
  onClick: PropTypes.func,
  active: PropTypes.bool,
  sx: PropTypes.object,
}

export function MessageActions(props) {
  const primary = props.primary ?? []
  const toggles = props.toggles ?? []
  const renderItem = item => (
    <IconButton
      key={item.key}
      size={'small'}
      onClick={item.onClick}
      sx={{ minWidth: '26px', ...item.sx }}
    >
      <item.Icon
        sx={{ fontSize: item.size ?? 17, color: item.active ? 'primary.main' : 'text.secondary' }}
      />
    </IconButton>
  )
  return (
    <Stack direction={'row'} spacing={0.5}>
      {primary.map(renderItem)}
      {primary.length > 0 && toggles.length > 0 && (
        <Divider orientation={'vertical'} flexItem sx={{ alignSelf: 'center', height: 16 }} />
      )}
      {toggles.map(renderItem)}
    </Stack>
  )
}

MessageActions.propTypes = {
  // the row before the divider: copy, delete, refresh
  primary: PropTypes.arrayOf(PropTypes.shape(ITEM_SHAPE)),
  // the row after the divider: the active-capable view toggles
  toggles: PropTypes.arrayOf(PropTypes.shape(ITEM_SHAPE)),
}
