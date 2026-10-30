/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The no-chat placeholder of the chat area.
 */
import { useTranslation } from 'react-i18next'
import { Stack, Typography } from '@mui/material'
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline'

export function ChatEmptyPage() {
  const { t } = useTranslation()
  return (
    <Stack height={1} spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <ChatBubbleOutline sx={{ fontSize: 48, color: 'text.secondary' }} />
      <Typography variant={'h6'} fontWeight={500} color={'text.primary'}>
        {t('chat_empty.t_no_chat')}
      </Typography>
    </Stack>
  )
}
