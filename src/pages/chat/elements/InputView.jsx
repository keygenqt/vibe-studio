/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The chat composer: the handle, the quick actions, the stats and the input.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Box, Button, CircularProgress, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import Add from '@mui/icons-material/Add'
import Psychology from '@mui/icons-material/Psychology'
import Send from '@mui/icons-material/Send'
import Speed from '@mui/icons-material/Speed'
import Stop from '@mui/icons-material/Stop'
import { getCurrentWebview } from '@tauri-apps/api/webview'

import { HandleView } from '../../../layouts'
import { ModelCapability } from '../../components/model'
import { StatsView, Timer } from '../components'
import { AppMethod, useWorkspace, WorkspaceMethod } from '../../../core'
import { useDragResize, useElementHeight } from '../../../hooks'
import {
  CHAT_INPUT_SIZE_MIN,
  CHAT_INPUT_SIZE_AUTO_MAX,
  AppRoutes,
  COMPACT_PAGE_WIDTH,
} from '../../../constants'
import { AppNav } from '../../../utils'

import { QuickActions } from './QuickActions'

export function InputView(props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    draft,
    setDraft,
    send,
    sending,
    streaming,
    stop,
    onAttach,
    addAttachments,
    chatAttachments,
    canTranslate,
    groupModel,
    stats,
    contextLimit,
  } = props
  const inputRef = React.useRef(null)

  // the composer owns its drag: the size rides the workspace slice
  const composerRef = React.useRef(null)
  const [composerMeasureRef, blockHeight] = useElementHeight()
  const workspace = useWorkspace()
  const chatInputSize = workspace.chatInputSize
  // one element, two refs: the dragover bounds and the height watcher
  const setComposerRef = React.useCallback(
    node => {
      composerRef.current = node
      composerMeasureRef(node)
    },
    [composerMeasureRef]
  )

  const drag = useDragResize({
    axis: 'y',
    getSize: () => workspace.chatInputSize,
    onMove: size => {
      WorkspaceMethod.save({ chatInputSize: Math.round(size) })
    },
    onEnd: () => {
      // the release: the layout has settled — when the cap held the
      // drag back, the stored size returns to the rendered one
      if (blockHeight !== null && chatInputSize > blockHeight) {
        WorkspaceMethod.save({ chatInputSize: Math.round(blockHeight) })
      }
    },
  })

  // the last height the content growth asked for: while the layout
  // holds the box below it, the reconcile must not drag the size down
  const lastGrow = React.useRef(null)

  React.useEffect(() => {
    // the drag owns the size while active: onMove saves the wanted
    // height and the onEnd clamp reconciles it with the rendered one
    if (drag.dragging || blockHeight === null) return
    // the content growth is held by the layout cap: the stored size
    // is the wish, the reconcile must not drag it down
    if (lastGrow.current !== null && blockHeight < lastGrow.current) return
    // the observer lags the save by a frame: a fresh divergence may
    // be the layout catching up — only a settled one is reconciled
    if (blockHeight === chatInputSize) return
    const timer = setTimeout(() => {
      WorkspaceMethod.save({ chatInputSize: blockHeight })
    }, 100)
    return () => clearTimeout(timer)
  }, [blockHeight, chatInputSize])

  // the content overflow grows the composer: the textarea fills the
  // box, so its scroll delta adds straight to the height
  React.useEffect(() => {
    const el = inputRef.current
    if (!el || blockHeight === null || drag.dragging) return
    // the confirmed growth frees the hand: the cap is no longer held
    if (lastGrow.current !== null && blockHeight >= lastGrow.current) {
      lastGrow.current = null
    }
    const overflow = el.scrollHeight - el.clientHeight
    if (overflow <= 0) {
      lastGrow.current = null
      return
    }
    // the layout holds the box below the asked height: growing is
    // pointless until the window gives the room back
    if (lastGrow.current !== null && blockHeight < lastGrow.current) return
    const next = Math.min(chatInputSize + overflow, CHAT_INPUT_SIZE_AUTO_MAX)
    if (next > chatInputSize) {
      lastGrow.current = next
      WorkspaceMethod.save({ chatInputSize: next })
    }
  }, [draft, blockHeight, chatInputSize])

  // the mode toggles of the composer: the translate flag rides the send
  const [quick, setQuick] = React.useState([])
  // the webview drag hover over the composer: paints the overlay
  const [dragOver, setDragOver] = React.useState(false)

  // the disabled input cannot take focus, so refocus after sending ends
  React.useEffect(() => {
    if (!sending) inputRef.current?.focus()
  }, [sending])

  // the paste is intercepted: Rust resolves the clipboard kind — text
  // goes to the draft at the cursor, files and images to the attachments
  const onPaste = event => {
    event.preventDefault()
    AppMethod.clipboardRead()
      .then(content => {
        if (!content) return
        if (content.kind === 'text') {
          const input = inputRef.current
          const start = input?.selectionStart ?? draft.length
          const end = input?.selectionEnd ?? draft.length
          setDraft(draft.slice(0, start) + content.text + draft.slice(end))
          const cursor = start + content.text.length
          // the cursor restores after the controlled update paints
          requestAnimationFrame(() => input?.setSelectionRange(cursor, cursor))
        } else if (content.kind === 'files') {
          return AppMethod.attachmentItems(content.paths).then(addAttachments)
        } else {
          addAttachments([{ kind: 'image', png: content.png }])
        }
      })
      .catch(console.error)
  }

  // the send carries the quick toggles: the translate flag of the draft
  const doSend = () => send(quick.includes('translate'))

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
        // the wire answers with the ready draft items: dirs expanded,
        // duplicates and missing paths already gone
        if (inside)
          AppMethod.attachmentItems(payload.paths)
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        // the automatic minimum is the flex floor: without the reset
        // the wrapper refuses to shrink below its content
        minHeight: 0,
      }}
    >
      {/* horizontal mirror of the sidebar handle: dragging up grows the composer */}
      <HandleView orientation="horizontal" onPointerDown={drag.onHandlePointerDown} />
      <Box
        ref={setComposerRef}
        sx={{
          position: 'relative',
          // the user size yields to the column: the flex deficit
          // shrinks the box, the floor keeps the minimum
          flexShrink: 1,
          minHeight: CHAT_INPUT_SIZE_MIN,
          height: chatInputSize,
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
              <Stack direction={'row'} spacing={1} alignItems={'center'}>
                <Timer />
                <CircularProgress size={14} color={'inherit'} />
              </Stack>
            ) : (
              <Stack direction={'row'} spacing={1} alignItems={'center'}>
                {/* the knob rides the settable models: effort is born concrete there */}
                {groupModel?.effort && (
                  <Tooltip title={t('chat.t_effort')}>
                    <Button
                      size={'small'}
                      startIcon={<Speed sx={{ fontSize: 16 }} />}
                      onClick={() => AppNav.open(navigate, AppRoutes.model(groupModel.id))}
                      sx={{ color: 'text.secondary', minWidth: 0, px: 1 }}
                    >
                      <Typography variant={'caption'}>
                        {groupModel.effort.charAt(0).toUpperCase() + groupModel.effort.slice(1)}
                      </Typography>
                    </Button>
                  </Tooltip>
                )}
                {groupModel?.think != null && (
                  <Tooltip title={t('chat.t_think')}>
                    <Button
                      size={'small'}
                      startIcon={<Psychology sx={{ fontSize: 16 }} />}
                      onClick={() => AppNav.open(navigate, AppRoutes.model(groupModel.id))}
                      sx={{ color: 'text.secondary', minWidth: 0, px: 1 }}
                    >
                      <Typography variant={'caption'}>
                        {groupModel.think ? t('chat.t_enabled') : t('chat.t_disabled')}
                      </Typography>
                    </Button>
                  </Tooltip>
                )}
                <StatsView stats={stats} contextLimit={contextLimit} />
              </Stack>
            )}
          </Stack>
          <Stack
            direction={'row'}
            spacing={1}
            alignItems={'flex-start'}
            sx={{
              flexGrow: 1,
              minHeight: 0,
              '& .MuiFormControl-root': { boxSizing: 'border-box' },
            }}
          >
            <TextField
              multiline
              fullWidth
              variant={'standard'}
              inputRef={inputRef}
              placeholder={t('chat.t_placeholder')}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              sx={{
                flexGrow: 1,
                minWidth: 0,
                height: '100%',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                paddingX: 1.5,
                paddingY: 1,
              }}
              slotProps={{
                input: { disableUnderline: true, sx: { height: '100%', alignItems: 'flex-start' } },
                htmlInput: {
                  // no ScrollArea class: the padded toggle flips the width at
                  // the overflow boundary — the rewrap is the jitter
                  sx: {
                    height: '100% !important',
                    overflowY: 'auto !important',
                    // the reserved gutter keeps the width stable when the
                    // scrollbar appears at the cap
                    scrollbarGutter: 'stable',
                  },
                  autoComplete: 'off',
                  autoCorrect: 'off',
                  autoCapitalize: 'off',
                  spellCheck: false,
                  onKeyDown: event => {
                    if (event.key === 'Enter' && !event.shiftKey && !streaming) {
                      event.preventDefault()
                      doSend()
                    }
                  },
                  onPaste: onPaste,
                },
              }}
            />
            <Stack
              direction={'row'}
              spacing={1}
              alignItems={'center'}
              sx={{ flexShrink: 0, height: 50 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={streaming ? stop : doSend}
                disabled={!streaming && sending}
                startIcon={
                  streaming ? (
                    <Stop sx={{ color: 'primary.contrastText' }} />
                  ) : (
                    <Send sx={{ color: 'primary.contrastText' }} />
                  )
                }
                sx={{
                  minWidth: 48,
                  height: 48,
                  '& .MuiButton-icon': {
                    margin: 0,
                  },
                }}
              />
            </Stack>
          </Stack>
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
    </Box>
  )
}

InputView.propTypes = {
  draft: PropTypes.string.isRequired,
  setDraft: PropTypes.func.isRequired,
  // receives the translate flag of the quick toggles
  send: PropTypes.func.isRequired,
  sending: PropTypes.bool.isRequired,
  streaming: PropTypes.bool.isRequired,
  stop: PropTypes.func.isRequired,
  // opens the file picker; the selected paths land in the draft
  onAttach: PropTypes.func.isRequired,
  addAttachments: PropTypes.func.isRequired,
  chatAttachments: PropTypes.array.isRequired,
  // the translate quick action lives only with the translation model set
  canTranslate: PropTypes.bool.isRequired,
  // the group's model: the capability badges and the effort/think knobs
  groupModel: PropTypes.object,
  stats: PropTypes.object,
  // the context limit in thousands of tokens
  contextLimit: PropTypes.number,
}
