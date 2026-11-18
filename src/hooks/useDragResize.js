/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Drag resize of a workspace size: pure deltas, the sizing stays with the caller.
 */
import * as React from 'react'

import { usePointerMove } from './usePointerMove'
import { usePointerUp } from './usePointerUp'

export function useDragResize({ axis = 'x', getSize, onMove, onEnd }) {
  const [dragging, setDragging] = React.useState(false)
  // the drag origin: the pointer position, the starting size, the last computed size
  const origin = React.useRef(null)
  const handlers = React.useRef({ getSize, onMove, onEnd })
  handlers.current = { getSize, onMove, onEnd }

  usePointerMove({
    target: window,
    enabled: dragging,
    onEvent: event => {
      if (!origin.current) return
      const pos = axis === 'y' ? event.clientY : event.clientX
      // the composer grows upward: the vertical axis inverts the delta
      const delta = axis === 'y' ? origin.current.pos - pos : pos - origin.current.pos
      const size = Math.max(0, origin.current.size + delta)
      origin.current.last = size
      handlers.current.onMove?.(size)
    },
  })

  usePointerUp({
    target: window,
    enabled: dragging,
    onEvent: () => {
      if (!origin.current) return
      setDragging(false)
      const last = origin.current.last
      origin.current = null
      handlers.current.onEnd?.(last)
    },
  })

  const onHandlePointerDown = React.useCallback(
    event => {
      event.preventDefault()
      const size = handlers.current.getSize?.() ?? 0
      origin.current = {
        pos: axis === 'y' ? event.clientY : event.clientX,
        size,
        last: size,
      }
      setDragging(true)
    },
    [axis]
  )

  return { dragging, onHandlePointerDown }
}
