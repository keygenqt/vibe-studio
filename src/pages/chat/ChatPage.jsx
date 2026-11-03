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

import { DeleteDialog, HandleView } from '../../components/views'
import { WaitState } from '../../components/states'
import { ScrollPanel } from '../../components/layouts'
import { useCoreChat, useCoreGroupsChat, useCoreSettings, useCoreWorkspace } from '../../hooks'
import { Methods } from '../../modules'
import { AppUtils } from '../../utils'

import { ChatEmptyPage } from '../chat_empty/ChatEmptyPage'
import { ChatTitleView } from './elements/ChatTitleView'
import { UserMessageView } from './elements/UserMessageView'
import { ModelMessageView } from './elements/ModelMessageView'
import { QuickActions } from './elements/QuickActions'
import { InputView } from './elements/InputView'

export function ChatPage() {
  const { chatId } = useParams()
  const { t, i18n } = useTranslation()
  const cid = Number(chatId)
  const workspace = useCoreWorkspace()
  const { chats, ready: groupsReady } = useCoreGroupsChat()
  const {
    draft,
    chatAttachments,
    addAttachments,
    setDraft,
    send,
    sending,
    streaming,
    stop,
    remove,
    resend,
    history,
    stream,
    translateStream,
    stats,
    ready: chatReady,
  } = useCoreChat({ chatId: cid })
  const { settings } = useCoreSettings()
  const [quick, setQuick] = React.useState([])
  // the pending confirmation: {action: 'delete' | 'resend', messageId}
  const [confirm, setConfirm] = React.useState(null)
  // the open of the translation view translates anew, the close
  // clears — the errors surface in the view
  const translate = messageId => Methods.chat_translate_message(cid, messageId)
  const translateClear = messageId => Methods.chat_translate_clear(cid, messageId)
  const chat = chats?.find(item => item.id === cid) ?? null
  // the message text size: the store resolves the untouched value
  const fontSize = settings.appearance_chat_font_size
  // the newest progress row owns the live stream
  const progressRow = (history ?? []).findLast(item => item.status === 'progress') ?? null

  // the newest message stays in view after history updates and chat switches
  React.useEffect(() => {
    const el = document.querySelector('[data-scroll-key="chat.history"]')
    if (el) el.scrollTop = el.scrollHeight
  }, [history, stream, chatId])

  const viewMessage = message => ({
    ...message,
    author: message.model ?? t('chat.t_you'),
    time: AppUtils.formatTime(i18n.language, message.created_at),
  })

  const renderMessage = (message, key) => {
    const view = viewMessage(message)
    return message.model === null && message.status === 'complete' ? (
      <UserMessageView
        key={key}
        message={view}
        fontSize={fontSize}
        onRefresh={() => setConfirm({ action: 'resend', messageId: message.id })}
        onDelete={() => setConfirm({ action: 'delete', messageId: message.id })}
      />
    ) : (
      <ModelMessageView
        key={key}
        message={view}
        fontSize={fontSize}
        translation={
          translateStream && translateStream.messageId === message.id
            ? translateStream.text
            : message.translate
        }
        translating={translateStream?.messageId === message.id}
        onTranslate={translate}
        onTranslateClose={translateClear}
        onDelete={() => setConfirm({ action: 'delete', messageId: message.id })}
      />
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
              <QuickActions
                quick={quick}
                onQuick={setQuick}
                attachCount={chatAttachments.length}
                stats={AppUtils.formatStats(stats)}
                loading={streaming}
              />
              <InputView
                draft={draft}
                setDraft={setDraft}
                onAttachments={addAttachments}
                send={send}
                sending={sending}
                streaming={streaming}
                stop={stop}
              />
            </Stack>
          </Box>
          <DeleteDialog
            open={confirm !== null}
            title={t(
              confirm?.action === 'resend'
                ? 'chat.t_message_resend_title'
                : 'chat.t_message_delete_title'
            )}
            text={t(
              confirm?.action === 'resend'
                ? 'chat.t_message_resend_text'
                : 'chat.t_message_delete_text'
            )}
            confirmText={confirm?.action === 'resend' ? t('chat.t_message_resend') : undefined}
            onCancel={() => setConfirm(null)}
            onConfirm={() => {
              if (confirm?.action === 'resend') resend(confirm.messageId)
              if (confirm?.action === 'delete') remove(confirm.messageId)
              setConfirm(null)
            }}
          />
        </>
      ) : (
        <ChatEmptyPage />
      )}
    </WaitState>
  )
}
