/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Workspace access: shell state and drag handles.
 */
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { CHAT_INPUT_SIZE_MIN, SIDE_BAR_SIZE_MAX, SIDE_BAR_SIZE_MIN } from '../constants'
import { Methods } from '../modules'
import { AppUtils } from '../utils'
import { chatInputSizeSet, sideBarSizeSet, workspaceSet } from '../store/impl/workspace'

export function useCoreWorkspace() {
  const dispatch = useDispatch()
  const raw = useSelector(state => state.workspace)
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => {
    Methods.get_workspace()
  }, [])

  const wire = () => ({
    window_width: raw.window_width,
    window_height: raw.window_height,
    chat_input_size: raw.chat_input_size,
    side_bar_size: raw.side_bar_size,
    side_bar_collapsed: raw.side_bar_collapsed,
  })

  const toggleSidebar = () => {
    if (!raw.ready) return
    const next = !raw.side_bar_collapsed
    dispatch(workspaceSet({ side_bar_collapsed: next }))
    Methods.save_workspace({ ...wire(), side_bar_collapsed: next })
  }

  const onSidebarHandlePointerDown = event => {
    if (!raw.ready) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    const startX = event.clientX
    const base = wire()
    let size = base.side_bar_size
    setDragging(true)

    const onPointerMove = move => {
      size = AppUtils.clamp(
        Math.round(base.side_bar_size + move.clientX - startX),
        SIDE_BAR_SIZE_MIN,
        SIDE_BAR_SIZE_MAX
      )
      dispatch(sideBarSizeSet(size))
    }

    const onPointerUp = () => {
      handle.removeEventListener('pointermove', onPointerMove)
      handle.removeEventListener('pointerup', onPointerUp)
      setDragging(false)
      Methods.save_workspace({ ...base, side_bar_size: size })
    }

    handle.addEventListener('pointermove', onPointerMove)
    handle.addEventListener('pointerup', onPointerUp)
  }

  const onComposerHandlePointerDown = event => {
    if (!raw.ready) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    const startY = event.clientY
    const base = wire()
    // the ceiling: the column minus the rigid siblings and the gaps —
    // the composer is the handle's next sibling, the flexible history
    // holds nothing to give
    const composer = handle.nextElementSibling
    const column = handle.parentElement
    let maxSize = null
    if (composer && column) {
      const rigid = [...column.children].filter(
        child => child !== composer && Number(getComputedStyle(child).flexGrow) === 0
      )
      const gap = parseFloat(getComputedStyle(column).rowGap) || 0
      const taken =
        rigid.reduce((sum, child) => sum + child.offsetHeight, 0) +
        gap * (column.children.length - 1)
      maxSize = Math.max(CHAT_INPUT_SIZE_MIN, column.clientHeight - taken)
    }
    let size = base.chat_input_size
    setDragging(true)

    const onPointerMove = move => {
      // rounded — the wire type is i32, clientY comes fractional
      let next = Math.max(
        CHAT_INPUT_SIZE_MIN,
        Math.round(base.chat_input_size + startY - move.clientY)
      )
      // the ceiling is the available height: above it the flex pins
      // the box — the size never lands in the store
      if (maxSize !== null) next = Math.min(next, maxSize)
      // the idle ticks skip: no size change — no dispatch, no render
      if (next === size) return

      // @todo
      console.log('yes: ' + next)

      size = next
      dispatch(chatInputSizeSet(size))
    }

    const onPointerUp = () => {
      handle.removeEventListener('pointermove', onPointerMove)
      handle.removeEventListener('pointerup', onPointerUp)
      setDragging(false)
      Methods.save_workspace({ ...base, chat_input_size: size })
    }

    handle.addEventListener('pointermove', onPointerMove)
    handle.addEventListener('pointerup', onPointerUp)
  }

  return {
    ready: raw.ready,
    dragging,
    chatInputSize: raw.chat_input_size,
    sideBarSize: raw.side_bar_size,
    sideBarCollapsed: raw.side_bar_collapsed,
    toggleSidebar,
    onSidebarHandlePointerDown,
    onComposerHandlePointerDown,
  }
}
