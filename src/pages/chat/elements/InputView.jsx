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

import { HandleView, ModelCapability, StatsView } from '../../../components/views'
import { Methods } from '../../../modules'
import { AppRoutes, COMPACT_PAGE_WIDTH } from '../../../constants'
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
    chatInputSize,
    onHandlePointerDown,
    onAttach,
    addAttachments,
    chatAttachments,
    canTranslate,
    groupModel,
    stats,
    contextLimit,
  } = props
  const inputRef = React.useRef(null)
  // the mode toggles of the composer: the translate flag rides the send
  const [quick, setQuick] = React.useState([])
  // the webview drag hover over the composer: paints the overlay
  const [dragOver, setDragOver] = React.useState(false)
  const composerRef = React.useRef(null)

  // the disabled input cannot take focus, so refocus after sending ends
  React.useEffect(() => {
    if (!sending) inputRef.current?.focus()
  }, [sending])

  // the paste is intercepted: Rust resolves the clipboard kind — text
  // goes to the draft at the cursor, files and images to the attachments
  const onPaste = event => {
    event.preventDefault()
    Methods.clipboard_read()
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
          addAttachments(content.paths.map(path => ({ kind: 'file', path })))
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

  return (
    <>
      {/* horizontal mirror of the sidebar handle: dragging up grows the composer */}
      <HandleView orientation="horizontal" onPointerDown={props.onHandlePointerDown} />
      <Box
        ref={composerRef}
        sx={{
          position: 'relative',
          flexShrink: 0,
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
              <CircularProgress size={14} color={'inherit'} />
            ) : (
              <Stack direction={'row'} spacing={1} alignItems={'center'}>
                {/* the untouched knob hides: the provider default applies */}
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
    </>
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
  // the user-dragged base height of the composer
  chatInputSize: PropTypes.number.isRequired,
  // starts the composer height drag
  onHandlePointerDown: PropTypes.func.isRequired,
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
