/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Lazy markdown: only the viewport-entering text parses, the rest stays flat.
 */
import * as React from 'react'
import PropTypes from 'prop-types'
import { Box, Typography } from '@mui/material'

import { MarkdownView } from '../../../components/views'

function DeferredMarkdownBase(props) {
  // the chat opens at the bottom: the tail renders markdown at once,
  // everything above waits for the viewport
  const [visible, setVisible] = React.useState(props.immediate === true)
  const ref = React.useRef(null)

  React.useEffect(() => {
    if (visible || ref.current === null) return
    // one shot: once seen, the markdown stays — scrolling away does
    // not downgrade the message back to the flat text; the scroll
    // itself is the follow mode's business
    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        setVisible(true)
      },
      // the chat history scroller; the margin warms the messages just
      // outside the viewport
      { root: document.querySelector('[data-scroll-key="chat.history"]'), rootMargin: '200px' }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible])

  return (
    <Box ref={ref} sx={{ minWidth: 0 }}>
      {visible ? (
        <MarkdownView text={props.text} fontSize={props.fontSize} />
      ) : (
        <Typography
          variant={'body2'}
          color={'text.primary'}
          sx={{ whiteSpace: 'pre-wrap', fontSize: props.fontSize, lineHeight: 1.5 }}
        >
          {props.text}
        </Typography>
      )}
    </Box>
  )
}

DeferredMarkdownBase.propTypes = {
  // the markdown text of the answer or the translation
  text: PropTypes.string.isRequired,
  // the message text size in px
  fontSize: PropTypes.number.isRequired,
  // render markdown without waiting for the viewport — the visible tail
  immediate: PropTypes.bool,
}

// the memo: the finished messages skip the stream ticks — only the
// growing one re-renders
export const DeferredMarkdown = React.memo(DeferredMarkdownBase)
