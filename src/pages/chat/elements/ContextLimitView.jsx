/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The context limit plate: the warning when the chat exceeds the limit.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Divider, Stack, Typography } from '@mui/material'

export function ContextLimitView(props) {
  const { t } = useTranslation()
  return (
    <Stack direction={'row'} spacing={1} alignItems={'center'} sx={{ paddingY: 1 }}>
      <Divider sx={{ flexGrow: 1, borderColor: 'warning.main', borderStyle: 'dashed' }} />
      <Typography variant={'caption'} fontWeight={700} noWrap color={'warning.main'}>
        {t('chat.t_context_limit_reached', { limit: props.limit })}
      </Typography>
      <Divider sx={{ flexGrow: 1, borderColor: 'warning.main', borderStyle: 'dashed' }} />
    </Stack>
  )
}

ContextLimitView.propTypes = {
  // the context limit in thousands of tokens
  limit: PropTypes.number.isRequired,
}
