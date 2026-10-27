/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import { Stack, Typography } from '@mui/material'

export function ErrorState(props) {
  const { t } = useTranslation()
  return (
    <Stack height={1} spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <ErrorOutline sx={{ fontSize: 56, color: 'error.main' }} />
      <Typography variant={'body1'} color={'text.primary'} textAlign={'center'}>
        {props.text ? props.text : t('common.t_error_data')}
      </Typography>
    </Stack>
  )
}

ErrorState.propTypes = {
  text: PropTypes.string,
}
