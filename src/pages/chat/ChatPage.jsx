/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Box, Stack, Typography } from '@mui/material'

import { PageHeader } from '../../components/views'
import { WaitState } from '../../components/states'

import { ChatEmptyPage } from '../chat_empty/ChatEmptyPage'
import { useChat, useCoreGroupsChat } from '../../hooks'

export function ChatPage() {
  const { chatId } = useParams()
  const { t } = useTranslation()
  const cid = Number(chatId)
  const { chats, ready } = useCoreGroupsChat()
  const { messages } = useChat(cid)
  const chat = chats?.find(item => item.id === cid) ?? null

  return (
    <WaitState ready={ready}>
      {chat ? (
        <Stack spacing={2} sx={{ padding: 2, minHeight: 1, boxSizing: 'border-box' }}>
          <PageHeader title={t(chat.name)} subtitle={t('chat.t_subtitle')} />
          <Stack spacing={1} alignItems={'flex-end'}>
            {messages.map(message => (
              <Box
                key={`message-${message.id}`}
                sx={{
                  maxWidth: '70%',
                  paddingX: 2,
                  paddingY: 1,
                  borderRadius: 2,
                  backgroundColor: 'panel.main',
                  color: 'text.primary',
                }}
              >
                <Typography variant={'body2'}>{message.text}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      ) : (
        <ChatEmptyPage />
      )}
    </WaitState>
  )
}
