/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: The message bubble shell: frame, caption header, collapse clamp and copy accent.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import UnfoldLess from '@mui/icons-material/UnfoldLess'
import UnfoldMore from '@mui/icons-material/UnfoldMore'
import ContentCopy from '@mui/icons-material/ContentCopy'

import { CHAT_COLLAPSE_HEIGHT } from '../../../constants'

import { MessageActions } from './MessageActions'

export function MessageBubble(props) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef(null)
  React.useEffect(() => () => timer.current && clearTimeout(timer.current), [])

  // the copy handler resolves `true` on success — the button paints
  // accent for 2 s
  const onClickCopy = () => {
    if (copied) return
    props.onCopy().then(result => {
      if (result !== true) return
      setCopied(true)
      timer.current = setTimeout(() => setCopied(false), 2000)
    })
  }

  // the tone serves both the fill and the clamp gradient
  const colorOf = theme => (typeof props.tone === 'function' ? props.tone(theme) : props.tone)

  // the copy button leads the primary row when the view gave a handler
  const primary = [...(props.primary ?? [])]
  if (props.onCopy) {
    primary.unshift({
      key: 'copy',
      Icon: ContentCopy,
      size: 14,
      onClick: onClickCopy,
      active: copied,
    })
  }

  return (
    <Stack spacing={1}>
      <Box
        sx={{
          paddingX: 1.5,
          paddingTop: 1,
          paddingBottom: 1.5,
          borderRadius: 2,
          backgroundColor: props.tone,
        }}
      >
        <Stack
          direction={'row'}
          spacing={1}
          alignItems={'center'}
          justifyContent={'space-between'}
          sx={{ pb: 1 }}
        >
          <Stack direction={'row'} alignItems={'center'}>
            {props.onToggleCollapse && (
              <IconButton
                size={'small'}
                onClick={props.onToggleCollapse}
                sx={{ position: 'relative', left: '-4px' }}
              >
                {props.collapsed ? (
                  <UnfoldMore sx={{ fontSize: 17, color: 'text.secondary' }} />
                ) : (
                  <UnfoldLess sx={{ fontSize: 17, color: 'text.secondary' }} />
                )}
              </IconButton>
            )}
            <Typography
              variant={'caption'}
              noWrap
              color={props.captionColor ?? 'text.secondary'}
              sx={{ minWidth: 0, paddingY: '4px' }}
            >
              {props.caption}
            </Typography>
          </Stack>
          <MessageActions primary={primary} toggles={props.toggles} />
        </Stack>
        <Box
          onClick={props.collapsed ? props.onToggleCollapse : undefined}
          sx={theme =>
            props.collapsed
              ? {
                  maxHeight: CHAT_COLLAPSE_HEIGHT,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: `linear-gradient(0deg, ${colorOf(theme)} 0%, rgba(0, 0, 0, 0) 100%)`,
                  },
                }
              : undefined
          }
        >
          {props.children}
        </Box>
      </Box>
    </Stack>
  )
}

MessageBubble.propTypes = {
  // the bubble fill and the clamp gradient: a token or a theme function
  tone: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  caption: PropTypes.string.isRequired,
  captionColor: PropTypes.string,
  // the collapse clamp flag
  collapsed: PropTypes.bool,
  // undefined hides the collapse button and the clamp click
  onToggleCollapse: PropTypes.func,
  // the copy logic of the view: resolves `true` on success
  onCopy: PropTypes.func,
  // the action rows: primary before the divider, toggles after
  primary: PropTypes.arrayOf(PropTypes.object),
  toggles: PropTypes.arrayOf(PropTypes.object),
  children: PropTypes.node,
}
