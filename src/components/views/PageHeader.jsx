/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Page title with an optional subtitle.
 */
import PropTypes from 'prop-types'
import { Stack, Typography } from '@mui/material'

export function PageHeader(props) {
  return (
    <Stack spacing={1} sx={{ flexShrink: 0 }}>
      <Typography variant={'h4'} fontWeight={500} color={'text.primary'}>
        {props.title}
      </Typography>
      {props.subtitle && (
        <Typography variant={'body2'} color={'text.secondary'}>
          {props.subtitle}
        </Typography>
      )}
    </Stack>
  )
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
}
