/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: A chat message bubble: role styling and local time.
 */
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Box, Stack, Typography } from '@mui/material'

// i18next locale codes to BCP 47: Intl throws on unknown codes like 'cn'
const LOCALES = { ru: 'ru', en: 'en', cn: 'zh-CN' }

// bubble colors per role: the user right on the accent, the model
// left on the panel, a failed request left on the error color
const BUBBLES = {
  user: { backgroundColor: 'primary.main', color: 'primary.contrastText' },
  assistant: { backgroundColor: 'panel.main', color: 'text.primary' },
  error: { backgroundColor: 'error.main', color: 'error.contrastText' },
}

export function MessageView(props) {
  const { i18n } = useTranslation()
  const role = props.message.role
  const align = role === 'user' ? 'flex-end' : 'flex-start'
  const time = new Intl.DateTimeFormat(LOCALES[i18n.language], {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(props.message.created_at))

  return (
    <Stack spacing={0.5} sx={{ maxWidth: '70%', alignSelf: align }}>
      <Box sx={{ paddingX: 1.5, paddingY: 1, borderRadius: 2, ...BUBBLES[role] }}>
        <Typography variant={'body2'}>{props.message.text}</Typography>
      </Box>
      <Typography variant={'caption'} color={'text.secondary'} sx={{ alignSelf: align }}>
        {time}
      </Typography>
    </Stack>
  )
}

MessageView.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number.isRequired,
    role: PropTypes.oneOf(['user', 'assistant', 'error']).isRequired,
    text: PropTypes.string.isRequired,
    created_at: PropTypes.number.isRequired,
  }).isRequired,
}
