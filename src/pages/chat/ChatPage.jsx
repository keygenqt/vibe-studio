/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components', 'hooks']
 * INFO: The chat page: the routed chat's message history.
 */
import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Stack } from '@mui/material'

import { WaitState } from '../../components/states'
import { ScrollPanel } from '../../components/layouts'

import { Methods } from '../../modules'

import { ChatEmptyPage } from '../chat_empty/ChatEmptyPage'
import { useCoreChat, useCoreGroupsChat, useCoreSettings } from '../../hooks'

import { ChatTitleView } from './elements/ChatTitleView'
import { MessageView } from './elements/MessageView'

export function ChatPage() {
  const { chatId } = useParams()
  const { t } = useTranslation()
  const cid = Number(chatId)
  const { chats, ready: groupsReady } = useCoreGroupsChat()
  const { history, stream, ready: chatReady } = useCoreChat({ chatId: cid })
  const { settings } = useCoreSettings()
  const chat = chats?.find(item => item.id === cid) ?? null
  // the live answer paints over its progress row: the row carries
  // the model name, the stream carries the growing text. findLast:
  // while a newer send evicts the old stream, two progress rows
  // coexist for a moment — the live one is the newest
  const progressRow = (history ?? []).findLast(item => item.status === 'progress') ?? null

  // the newest message stays in view: the scroll follows each
  // history change and the chat switch
  React.useEffect(() => {
    const el = document.querySelector('[data-scroll-key="chat.history"]')
    if (el) el.scrollTop = el.scrollHeight
  }, [history, stream, chatId])

  return (
    <WaitState ready={groupsReady && chatReady}>
      {chat ? (
        <>
          <ChatTitleView
            name={t(chat.name)}
            canRename={(history ?? []).length > 0 && settings.tasks_model_light !== null}
            onRename={() => Methods.chat_regenerate_name(cid).catch(console.error)}
          />
          <ScrollPanel scrollKey={'chat.history'} sx={{ flexGrow: 1, minHeight: 0 }}>
            <Stack spacing={1.5}>
              {(history ?? [])
                .filter(message => message.status !== 'progress')
                .map(message => (
                  <MessageView key={`message-${message.id}`} message={message} />
                ))}
              {stream && (
                <MessageView
                  key={'message-stream'}
                  message={{
                    id: progressRow?.id ?? -1,
                    provider: progressRow?.provider ?? null,
                    model: progressRow?.model ?? null,
                    status: 'progress',
                    text: stream.text,
                    thinking: stream.thinking,
                    created_at: progressRow?.created_at ?? Date.now(),
                  }}
                />
              )}
            </Stack>
          </ScrollPanel>
        </>
      ) : (
        <ChatEmptyPage />
      )}
    </WaitState>
  )
}
