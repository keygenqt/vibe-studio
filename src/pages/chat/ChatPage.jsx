/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The chat page: the message history and the composer draft.
 */
import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Box, Chip, Stack } from '@mui/material'
import DeleteSweep from '@mui/icons-material/DeleteSweep'

import { AttachmentChip } from './components'
import { DeleteDialog } from '../components/dialogs'
import { OutletLayout, ScrollLayout } from '../../layouts'
import {
  AppMethod,
  ChatMethod,
  GroupsChatMethod,
  UiMethod,
  useChats,
  useChat,
  useComposer,
  useGroupsChat,
  useModels,
  useSettings,
  useStream,
  useTranslate,
  WorkspaceMethod,
} from '../../core'
import { CHAT_INPUT_SIZE_MIN } from '../../constants'
import { AppUtils } from '../../utils'
import { scrollToBottom, watchBottom } from '../../init'

import { ChatTitleView } from './elements/ChatTitleView'
import { ContextLimitView } from './elements/ContextLimitView'
import { CompressBubble } from './elements/CompressBubble'
import { UserBubble } from './elements/UserBubble'
import { ModelBubble } from './elements/ModelBubble'
import { InputView } from './elements/InputView'

export function ChatPage() {
  const { chatId } = useParams()
  const { t, i18n } = useTranslation()
  const cid = Number(chatId)
  const { ready: chatsReady } = useChats()
  const { groupsChat, ready: groupsReady } = useGroupsChat()
  const { models } = useModels()
  const { settings } = useSettings()
  const { chat, stats, history, ready: chatReady, error: chatError } = useChat({ chatId: cid })
  const { draft, chatAttachments } = useComposer()
  const { stream, streaming } = useStream(cid)
  const { translateStream } = useTranslate()
  const [sending, setSending] = React.useState(false)
  // the pending confirmation: {action: 'delete' | 'resend', messageId}
  const [confirm, setConfirm] = React.useState(null)
  // the clear-all confirmation: the wipe touches the whole draft set
  const [confirmClear, setConfirmClear] = React.useState(false)
  // the composer writes live in the block; the send is a page gesture
  const setDraft = value => ChatMethod.setDraft(value)
  const addAttachments = items => ChatMethod.addAttachments(items)
  const removeAttachment = index => ChatMethod.removeAttachment(index)
  const clearAttachments = () => ChatMethod.clearAttachments()
  const send = translate => {
    setSending(true)
    // clear input data
    WorkspaceMethod.save({ chatInputSize: CHAT_INPUT_SIZE_MIN })
    // scroll to bottom chat
    scrollToBottom(scrollKey)
    // send data
    ChatMethod.sendMessage(cid, draft, translate, chatAttachments)
      .catch(err => UiMethod.showError(String(err)))
      .finally(() => setSending(false))
  }
  const stop = () => ChatMethod.cancelSend(cid)
  const remove = messageId => ChatMethod.deleteMessage(cid, messageId)
  const resend = messageId => ChatMethod.resendMessage(cid, messageId)
  // the translation view shows the stored one, an empty column
  // generates once — the errors surface in the view
  const translate = messageId => ChatMethod.translateMessage(cid, messageId)
  // the picker answers with the selected paths or null on the cancel
  const onAttach = () =>
    AppMethod.dialogOpenFiles()
      .then(paths => paths && AppMethod.attachmentItems(paths).then(addAttachments))
      .catch(console.error)
  // the group's model: the capability badges paint near the quick actions
  const group = (groupsChat ?? []).find(item => item.id === chat?.groupChatId) ?? null
  const groupModel = (models ?? []).find(item => item.id === group?.modelId) ?? null
  // the message text size: the store resolves the untouched value
  const fontSize = settings.appearanceChatFontSize
  // the translate actions live only with the translation model set
  const canTranslate = settings.translationModel !== null
  // the summary view lives only with the light task model set: the
  // summary is its job
  const canSummarize = settings.tasksModelLight !== null
  const setShowType = (messageId, showType) =>
    ChatMethod.setMessageShowType(cid, messageId, showType)
  const setCollapsed = (messageId, collapsed) =>
    ChatMethod.setMessageCollapsed(cid, messageId, collapsed)
  // the newest progress row owns the live stream
  const progressRow = (history ?? []).findLast(item => item.status === 'progress') ?? null
  // the running compress: the history hides, the attempt paints alone
  const compressAttempt =
    (history ?? []).find(item => item.messageType === 'compress' && item.status === 'progress') ??
    null

  // the context limit plate: the measured input of each answer — the
  // plate paints after the first answer whose call crossed the limit
  const contextLimitId = React.useMemo(() => {
    if (!history || !settings.chatContextLimit) return null
    const limit = settings.chatContextLimit * 1000
    const crossed = history.find(
      message => message.messageType === 'assistant' && message.tokensInput > limit
    )
    return crossed?.id ?? null
  }, [history, settings.chatContextLimit])

  // the chat opens at the bottom: this many last messages render
  // markdown at once — the rest upgrade lazily on the scroll up
  const VISIBLE_TAIL = 4

  // the per-chat scroll key: the follow state and the saved position
  const scrollKey = `chat.history:${cid}`
  // the follow state of the history: the down button reads it
  const [atBottom, setAtBottom] = React.useState(true)
  React.useEffect(() => watchBottom(scrollKey, setAtBottom), [scrollKey])

  const viewMessage = message => ({
    ...message,
    author: message.model ?? t('chat.t_you'),
    time: AppUtils.formatTime(i18n.language, message.createdAt),
  })

  const renderMessage = (message, key, immediate = false) => {
    const view = viewMessage(message)
    return message.messageType === 'compress' ? (
      <CompressBubble
        key={key}
        message={{
          ...view,
          // the live snapshots paint the growing attempt only: the
          // finished base never merges — a send's stream belongs to
          // the answer bubble, not to the context
          text: message.status === 'progress' ? (stream?.text ?? message.text) : message.text,
          thinking:
            message.status === 'progress'
              ? (stream?.thinking ?? message.thinking)
              : message.thinking,
        }}
        fontSize={fontSize}
        immediate={immediate}
        onDelete={() => setConfirm({ action: 'delete', messageId: message.id })}
        onShowType={setShowType}
        onSetCollapsed={setCollapsed}
      />
    ) : message.messageType === 'user' ? (
      <UserBubble
        key={key}
        message={view}
        fontSize={fontSize}
        onRefresh={() => setConfirm({ action: 'resend', messageId: message.id })}
        onDelete={() => setConfirm({ action: 'delete', messageId: message.id })}
        onShowType={setShowType}
        canSummarize={canSummarize}
        onSetCollapsed={setCollapsed}
      />
    ) : (
      <ModelBubble
        key={key}
        message={view}
        fontSize={fontSize}
        immediate={immediate}
        translation={
          translateStream && translateStream.messageId === message.id
            ? translateStream.text
            : message.translate
        }
        translating={translateStream?.messageId === message.id}
        onTranslate={canTranslate ? translate : undefined}
        onDelete={() => setConfirm({ action: 'delete', messageId: message.id })}
        onShowType={setShowType}
        canSummarize={canSummarize}
        onSetCollapsed={setCollapsed}
      />
    )
  }

  return (
    <OutletLayout
      ready={groupsReady && chatsReady && chatReady}
      error={chatReady ? null : chatError}
      sx={{
        flexGrow: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {chat && (
        <>
          <ChatTitleView
            name={t(chat.name)}
            canScrollDown={!atBottom}
            onScrollDown={() => scrollToBottom(scrollKey)}
            canRename={(history ?? []).length > 0 && settings.tasksModelLight !== null}
            onRename={() => GroupsChatMethod.chatRegenerateName(cid)}
            canCompress={(history ?? []).length > 0}
            hasTaskModel={settings.tasksModelHeavy !== null}
            onCompress={useTaskModel => ChatMethod.compressMessage(cid, useTaskModel)}
          />
          <ScrollLayout
            scrollKey={scrollKey}
            follow
            ready={chatReady}
            sx={{ flexGrow: 1, flexShrink: 1, flexBasis: 0, minHeight: 150 }}
          >
            <Stack
              spacing={1.5}
              sx={{
                WebkitUserSelect: 'text !important',
                userSelect: 'text !important',
                '& *': {
                  WebkitUserSelect: 'text !important',
                  userSelect: 'text !important',
                },
              }}
            >
              {compressAttempt ? (
                // the running compress: the history hides, the attempt shows
                renderMessage(compressAttempt, 'message-compress', true)
              ) : (
                <>
                  {/* the progress row renders only uncovered by the live
                    bubble — the gap and the duplicate are both gone */}
                  {(history ?? [])
                    .filter(message => message.status !== 'progress' || !stream)
                    .map((message, index, list) => (
                      <React.Fragment key={`message-${message.id}`}>
                        {renderMessage(
                          message,
                          `message-${message.id}`,
                          index >= list.length - VISIBLE_TAIL
                        )}
                        {message.id === contextLimitId && (
                          <ContextLimitView limit={settings.chatContextLimit} />
                        )}
                      </React.Fragment>
                    ))}
                  {stream &&
                    progressRow &&
                    renderMessage(
                      {
                        id: progressRow?.id ?? -1,
                        messageType: 'assistant',
                        provider: progressRow?.provider ?? null,
                        model: progressRow?.model ?? null,
                        status: 'progress',
                        showType: progressRow?.showType ?? 'text',
                        text: stream.text,
                        thinking: stream.thinking,
                        createdAt: progressRow?.createdAt ?? Date.now(),
                      },
                      'message-stream',
                      true
                    )}
                </>
              )}
            </Stack>
          </ScrollLayout>

          <InputView
            draft={draft}
            setDraft={setDraft}
            send={translate => {
              // the running compress owns the chat: the send waits
              if (!compressAttempt) send(translate)
            }}
            sending={sending}
            streaming={streaming}
            stop={stop}
            onAttach={onAttach}
            addAttachments={addAttachments}
            chatAttachments={chatAttachments}
            canTranslate={canTranslate}
            groupModel={groupModel}
            stats={stats}
            contextLimit={settings.chatContextLimit}
          />

          {chatAttachments.length > 0 && (
            // the attachments bar under the composer: the shape of the title bar
            <Box
              sx={{
                flexShrink: 0,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                boxSizing: 'border-box',
                padding: 1.5,
              }}
            >
              <Stack direction={'row'} spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Chip
                  size={'small'}
                  icon={<DeleteSweep sx={{ fontSize: 14 }} />}
                  label={t('chat.t_attachments_clear')}
                  onClick={() => setConfirmClear(true)}
                />
                {chatAttachments.map((attachment, index) => (
                  <AttachmentChip
                    key={index}
                    attachment={
                      attachment.kind === 'file'
                        ? {
                            name: attachment.path.split('/').pop(),
                            path: attachment.path,
                            mime: attachment.mime ?? null,
                            size: attachment.size ?? null,
                          }
                        : {
                            name: 'image.png',
                            mime: 'image/png',
                            size: Math.round((attachment.png.length * 3) / 4),
                          }
                    }
                    onDelete={() => removeAttachment(index)}
                  />
                ))}
              </Stack>
            </Box>
          )}
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
          <DeleteDialog
            open={confirmClear}
            title={t('chat.t_attachments_clear_title')}
            text={t('chat.t_attachments_clear_text')}
            confirmText={t('chat.t_attachments_clear')}
            onCancel={() => setConfirmClear(false)}
            onConfirm={() => {
              clearAttachments()
              setConfirmClear(false)
            }}
          />
        </>
      )}
    </OutletLayout>
  )
}
