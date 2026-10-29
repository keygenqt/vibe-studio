/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 */
import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack } from '@mui/material'

import { WaitState } from '../../components/states'
import { ScrollPanel } from '../../components/layouts'

import { ChatEmptyPage } from '../chat_empty/ChatEmptyPage'
import { useCoreChat, useCoreGroupsChat } from '../../hooks'

import { MessageView } from './elements/MessageView'

export function ChatPage() {
  const { chatId } = useParams()
  const { t } = useTranslation()
  const cid = Number(chatId)
  const { chats, ready: groupsReady } = useCoreGroupsChat()
  const { history, ready: chatReady } = useCoreChat({ chatId: cid })
  const chat = chats?.find(item => item.id === cid) ?? null
  // the newest message stays in view: the scroll follows each
  // history change and the chat switch
  React.useEffect(() => {
    const el = document.querySelector('[data-scroll-key="chat.history"]')
    if (el) el.scrollTop = el.scrollHeight
  }, [history, chatId])

  return (
    <WaitState ready={groupsReady && chatReady}>
      {chat ? (
        <ScrollPanel scrollKey={'chat.history'} sx={{ height: 1 }}>
          <Stack spacing={1.5}>
            {(history ?? []).map(message => (
              <MessageView key={`message-${message.id}`} message={message} />
            ))}
          </Stack>
        </ScrollPanel>
      ) : (
        <ChatEmptyPage />
      )}
    </WaitState>
  )
}
