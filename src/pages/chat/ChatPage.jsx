/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The chat page: the message history and the composer draft.
 */
import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Box, CircularProgress, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Add from '@mui/icons-material/Add'
import { getCurrentWebview } from '@tauri-apps/api/webview'

import {
  AttachmentChip,
  DeleteDialog,
  HandleView,
  ModelCapability,
  StatsView,
} from '../../components/views'
import { ErrorSnackbar } from '../../components/snackbars'
import { WaitState } from '../../components/states'
import { ScrollPanel } from '../../components/layouts'
import { useCoreChat, useCoreGroupsChat, useCoreSettings, useCoreWorkspace } from '../../hooks'
import { Methods } from '../../modules'
import { CHAT_INPUT_SIZE_MAX, COMPACT_PAGE_WIDTH } from '../../constants'
import { pauseFollow, scrollToBottom, watchBottom } from '../../init'
import { AppUtils } from '../../utils'

import { ChatEmptyPage } from '../chat_empty/ChatEmptyPage'
import { ChatTitleView } from './elements/ChatTitleView'
import { ContextLimitView } from './elements/ContextLimitView'
import { CompressMessageView } from './elements/CompressMessageView'
import { UserMessageView } from './elements/UserMessageView'
import { ModelMessageView } from './elements/ModelMessageView'
import { QuickActions } from './elements/QuickActions'
import { InputView } from './elements/InputView'

export function ChatPage() {
  const { chatId } = useParams()
  const { t, i18n } = useTranslation()
  const cid = Number(chatId)
  const workspace = useCoreWorkspace()
  const { chats, groupsChat, models, ready: groupsReady } = useCoreGroupsChat()
  const {
    draft,
    chatAttachments,
    addAttachments,
    removeAttachment,
    sendError,
    setSendError,
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
  // the translation view shows the stored one, an empty column
  // generates once — the errors surface in the view
  const translate = messageId => Methods.chat_translate_message(cid, messageId)
  // the picker answers with the selected paths or null on the cancel
  const onAttach = () =>
    Methods.dialog_open_files()
      .then(paths => paths && addAttachments(paths.map(path => ({ kind: 'file', path }))))
      .catch(console.error)
  const chat = chats?.find(item => item.id === cid) ?? null
  // the group's model: the capability badges paint near the quick actions
  const group = (groupsChat ?? []).find(item => item.id === chat?.group_chat_id) ?? null
  const groupModel = (models ?? []).find(item => item.id === group?.model_id) ?? null
  // the message text size: the store resolves the untouched value
  const fontSize = settings.appearance_chat_font_size
  // the translate actions live only with the translation model set
  const canTranslate = settings.translation_model !== null
  // the summary view lives only with the light task model set: the
  // summary is its job
  const canSummarize = settings.tasks_model_light !== null
  const setShowType = (messageId, showType) => {
    pauseFollow('chat.history')
    return Methods.chat_set_message_show_type(cid, messageId, showType)
  }
  const setCollapsed = (messageId, collapsed) =>
    Methods.chat_set_message_collapsed(cid, messageId, collapsed)
  // the newest progress row owns the live stream
  const progressRow = (history ?? []).findLast(item => item.status === 'progress') ?? null
  // the running compress: the history hides, the attempt paints alone
  const compressAttempt =
    (history ?? []).find(item => item.message_type === 'compress' && item.status === 'progress') ??
    null

  // the context limit plate: the estimated prompt tokens of the
  // complete messages against the limit — the plate paints before
  // the first message that crosses it
  const contextLimitId = React.useMemo(() => {
    if (!history || !settings.chat_context_limit) return null
    const limit = settings.chat_context_limit * 1000
    let sum = 0
    for (const message of history) {
      if (message.status !== 'complete') continue
      sum += (message.tokens_answer ?? 0) + (message.tokens_compress ?? 0)
      if (sum > limit) return message.id
    }
    return null
  }, [history, settings.chat_context_limit])

  // the chat opens at the bottom: this many last messages render
  // markdown at once — the rest upgrade lazily on the scroll up
  const VISIBLE_TAIL = 4

  // the follow state of the history: the down button reads it
  const [atBottom, setAtBottom] = React.useState(true)
  // the composer growth over the base: the draft content, ephemeral —
  // the measured delta accumulates against the base, capped
  const [composerGrow, setComposerGrow] = React.useState(0)
  React.useEffect(() => watchBottom('chat.history', setAtBottom), [])

  // the webview drag hover over the composer: paints the overlay
  const [dragOver, setDragOver] = React.useState(false)
  const composerRef = React.useRef(null)

  // the callback rides the ref — the re-renders must not rebind
  // the webview listener
  const addAttachmentsRef = React.useRef(addAttachments)
  addAttachmentsRef.current = addAttachments

  // the Tauri webview drag events: the hover scopes to the composer
  // bounds, the drop feeds the paths into the draft attachments
  React.useEffect(() => {
    const unlisten = getCurrentWebview().onDragDropEvent(event => {
      const payload = event.payload
      // `leave` carries no position — the hint goes away first
      if (payload.type === 'leave') {
        setDragOver(false)
        return
      }
      const rect = composerRef.current?.getBoundingClientRect()
      if (!rect) return
      const pos = payload.position.toLogical(window.devicePixelRatio)
      const inside =
        pos.x >= rect.left && pos.x <= rect.right && pos.y >= rect.top && pos.y <= rect.bottom
      if (payload.type === 'drop') {
        setDragOver(false)
        // the draft carries the Rust facts: the chip paints the
        // folder, the image kind and the size; the wire carries
        // the path only
        if (inside)
          Promise.all(
            payload.paths.map(async path => {
              const stat = await Methods.attachment_stat(path)
              return stat.dir
                ? { kind: 'file', path, dir: true }
                : { kind: 'file', path, mime: stat.mime, size: stat.size }
            })
          )
            .then(addAttachmentsRef.current)
            .catch(console.error)
      } else {
        setDragOver(inside)
      }
    })
    return () => {
      unlisten.then(fn => fn())
    }
  }, [])

  // the chat switch lands at the bottom and re-arms the follow; the
  // content updates are the scroll area's own business
  React.useEffect(() => {
    scrollToBottom('chat.history')
  }, [chatId])

  const viewMessage = message => ({
    ...message,
    author: message.model ?? t('chat.t_you'),
    time: AppUtils.formatTime(i18n.language, message.created_at),
  })

  const renderMessage = (message, key, immediate = false) => {
    const view = viewMessage(message)
    return message.message_type === 'compress' ? (
      <CompressMessageView
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
    ) : message.message_type === 'user' ? (
      <UserMessageView
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
      <ModelMessageView
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
    <WaitState ready={groupsReady}>
      {chat ? (
        <>
          <ChatTitleView
            name={t(chat.name)}
            canScrollDown={!atBottom}
            onScrollDown={() => scrollToBottom('chat.history')}
            canRename={(history ?? []).length > 0 && settings.tasks_model_light !== null}
            onRename={() => Methods.chat_regenerate_name(cid).catch(console.error)}
            canCompress={(history ?? []).length > 0}
            hasTaskModel={settings.tasks_model_heavy !== null}
            onCompress={useTaskModel => Methods.chat_compress_message(cid, useTaskModel)}
          />
          <ScrollPanel
            scrollKey={'chat.history'}
            follow
            ready={chatReady}
            sx={{ flexGrow: 1, minHeight: 0 }}
          >
            <Stack spacing={1.5}>
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
                          <ContextLimitView limit={settings.chat_context_limit} />
                        )}
                      </React.Fragment>
                    ))}
                  {stream &&
                    progressRow &&
                    renderMessage(
                      {
                        id: progressRow?.id ?? -1,
                        message_type: 'assistant',
                        provider: progressRow?.provider ?? null,
                        model: progressRow?.model ?? null,
                        status: 'progress',
                        show_type: progressRow?.show_type ?? 'text',
                        text: stream.text,
                        thinking: stream.thinking,
                        created_at: progressRow?.created_at ?? Date.now(),
                      },
                      'message-stream',
                      true
                    )}
                </>
              )}
            </Stack>
          </ScrollPanel>
          {/* horizontal mirror of the sidebar handle: dragging up grows the composer */}
          <HandleView
            orientation="horizontal"
            onPointerDown={event => {
              // the drag starts from the live height and folds the
              // growth into the saved base; the draft scrolls inside
              // until the next content change
              setComposerGrow(0)
              workspace.onComposerHandlePointerDown(
                event,
                Math.min(workspace.chatInputSize + composerGrow, CHAT_INPUT_SIZE_MAX)
              )
            }}
          />
          <Box
            ref={composerRef}
            sx={{
              position: 'relative',
              flexShrink: 0,
              // the base from the drag plus the draft growth, capped —
              // the history yields its height to the growing composer
              height: Math.min(workspace.chatInputSize + composerGrow, CHAT_INPUT_SIZE_MAX),
              overflow: 'hidden',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              boxSizing: 'border-box',
              padding: 2,
              // the stats line folds by the box width, not the row
              containerType: 'inline-size',
            }}
          >
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Stack
                direction={'row'}
                spacing={1}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Stack direction={'row'} spacing={1} alignItems={'center'}>
                  <QuickActions
                    quick={quick}
                    onQuick={setQuick}
                    onAttach={onAttach}
                    translateEnabled={canTranslate}
                    attachCount={chatAttachments.length}
                  />
                  {/* the capability badges fold away in the narrow composer */}
                  <Box
                    sx={{
                      [`@container (max-width: ${COMPACT_PAGE_WIDTH - 1}px)`]: { display: 'none' },
                    }}
                  >
                    <ModelCapability capabilities={groupModel?.capabilities ?? undefined} />
                  </Box>
                </Stack>
                {streaming ? (
                  <CircularProgress size={14} color={'inherit'} />
                ) : (
                  <StatsView stats={stats} contextLimit={settings.chat_context_limit} />
                )}
              </Stack>
              <InputView
                draft={draft}
                setDraft={setDraft}
                onGrow={delta =>
                  setComposerGrow(g =>
                    Math.max(0, Math.min(g + delta, CHAT_INPUT_SIZE_MAX - workspace.chatInputSize))
                  )
                }
                onAttachments={addAttachments}
                send={() => {
                  // the running compress owns the chat: the send waits
                  if (!compressAttempt) send(quick.includes('translate'))
                }}
                sending={sending}
                streaming={streaming}
                stop={stop}
              />
            </Stack>
            {dragOver && (
              // the drop hint: the green wash over the composer, the plus in the middle
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'success.main',
                  backgroundColor: theme => alpha(theme.palette.success.main, 0.15),
                  pointerEvents: 'none',
                }}
              >
                <Add sx={{ color: 'success.main' }} />
              </Box>
            )}
          </Box>
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
                {chatAttachments.map((attachment, index) => (
                  <AttachmentChip
                    key={index}
                    attachment={
                      attachment.kind === 'file'
                        ? {
                            name: attachment.path.split('/').pop(),
                            mime: attachment.mime ?? null,
                            size: attachment.size ?? null,
                            dir: attachment.dir === true,
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
          <ErrorSnackbar
            text={sendError ? t(String(sendError)) : null}
            onClose={() => setSendError(null)}
          />
        </>
      ) : (
        <ChatEmptyPage />
      )}
    </WaitState>
  )
}
