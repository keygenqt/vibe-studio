/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The chat page: the message history and the composer draft.
 */
import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Box, Stack } from '@mui/material'

import { HandleView } from '../../components/views'
import { WaitState } from '../../components/states'
import { ScrollPanel } from '../../components/layouts'
import { useCoreChat, useCoreGroupsChat, useCoreSettings, useCoreWorkspace } from '../../hooks'
import { Methods } from '../../modules'

import { ChatEmptyPage } from '../chat_empty/ChatEmptyPage'
import { ChatTitleView } from './elements/ChatTitleView'
import { UserMessageView } from './elements/UserMessageView'
import { ModelMessageView } from './elements/ModelMessageView'
import { QuickActions } from './elements/QuickActions'
import { InputView } from './elements/InputView'

// @todo - utils
const LOCALES = { ru: 'ru', en: 'en', cn: 'zh-CN' }

// @todo - crates
const STATS = '49.2K Tokens · 38.3 Tokens/s'

export function ChatPage() {
  const { chatId } = useParams()
  const { t, i18n } = useTranslation()
  const cid = Number(chatId)
  const workspace = useCoreWorkspace()
  const { chats, ready: groupsReady } = useCoreGroupsChat()
  const {
    draft,
    setDraft,
    send,
    sending,
    streaming,
    stop,
    history,
    stream,
    ready: chatReady,
  } = useCoreChat({ chatId: cid })
  const { settings } = useCoreSettings()
  const [quick, setQuick] = React.useState([])
  const chat = chats?.find(item => item.id === cid) ?? null
  // the newest progress row owns the live stream
  const progressRow = (history ?? []).findLast(item => item.status === 'progress') ?? null

  // the newest message stays in view after history updates and chat switches
  React.useEffect(() => {
    const el = document.querySelector('[data-scroll-key="chat.history"]')
    if (el) el.scrollTop = el.scrollHeight
  }, [history, stream, chatId])

  const viewMessage = message => ({
    ...message,
    author: message.model ?? 'Вы',
    time: new Intl.DateTimeFormat(LOCALES[i18n.language], {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(message.created_at)),
  })

  const renderMessage = (message, key) => {
    const view = viewMessage(message)
    return message.model === null && message.status === 'complete' ? (
      <UserMessageView key={key} message={view} />
    ) : (
      <ModelMessageView key={key} message={view} />
    )
  }

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
                .map(message => renderMessage(message, `message-${message.id}`))}
              {stream &&
                renderMessage(
                  {
                    id: progressRow?.id ?? -1,
                    provider: progressRow?.provider ?? null,
                    model: progressRow?.model ?? null,
                    status: 'progress',
                    text: stream.text,
                    thinking: stream.thinking,
                    created_at: progressRow?.created_at ?? Date.now(),
                  },
                  'message-stream'
                )}
            </Stack>
          </ScrollPanel>
          {/* horizontal mirror of the sidebar handle: dragging up grows the composer */}
          <HandleView
            orientation="horizontal"
            onPointerDown={workspace.onComposerHandlePointerDown}
          />
          <Box
            sx={{
              flexShrink: 0,
              height: workspace.chatInputSize,
              overflow: 'hidden',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              boxSizing: 'border-box',
              padding: 2,
            }}
          >
            <Stack spacing={2} sx={{ height: '100%' }}>
              <QuickActions quick={quick} onQuick={setQuick} stats={STATS} />
              <InputView
                draft={draft}
                setDraft={setDraft}
                send={send}
                sending={sending}
                streaming={streaming}
                stop={stop}
              />
            </Stack>
          </Box>
        </>
      ) : (
        <ChatEmptyPage />
      )}
    </WaitState>
  )
}
