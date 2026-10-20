/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 */
import * as React from 'react'

import {
  CHAT_INPUT_SIZE_DEFAULT,
  CHAT_INPUT_SIZE_MAX,
  CHAT_INPUT_SIZE_MIN,
  SIDE_BAR_SIZE_DEFAULT,
  SIDE_BAR_SIZE_MAX,
  SIDE_BAR_SIZE_MIN,
} from '../constants/AppDefault'
import { Methods } from '../modules'

/**
 * Workspace state owner: user-sized panels. Loads once on mount,
 * live size while dragging, persisted once on release. Null fields
 * from Rust mean untouched — resolved to defaults here.
 */
export function useWorkspace() {
  const [workspace, setWorkspace] = React.useState(null)
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => {
    if (!window.isTauri) {
      setWorkspace({
        chatInputSize: CHAT_INPUT_SIZE_DEFAULT,
        sideBarSize: SIDE_BAR_SIZE_DEFAULT,
        sideBarCollapsed: false,
      })
      return undefined
    }
    let unmounted = false
    Methods.workspace_get().then(raw => {
      if (!unmounted) setWorkspace(resolve(raw))
    })
    return () => {
      unmounted = true
    }
  }, [])

  const toggleSidebar = () => {
    if (!workspace) return
    setWorkspace(prev => {
      if (!prev) return prev
      const next = { ...prev, sideBarCollapsed: !prev.sideBarCollapsed }
      Methods.workspace_set_side_bar(next.sideBarSize, next.sideBarCollapsed).then(raw =>
        setWorkspace(resolve(raw))
      )
      return next
    })
  }

  const onSidebarHandlePointerDown = event => {
    if (!workspace) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    const startX = event.clientX
    const startSize = workspace.sideBarSize
    const collapsed = workspace.sideBarCollapsed
    let size = startSize
    setDragging(true)

    const onPointerMove = move => {
      size = clamp(startSize + move.clientX - startX, SIDE_BAR_SIZE_MIN, SIDE_BAR_SIZE_MAX)
      setWorkspace(prev => ({ ...prev, sideBarSize: size }))
    }

    const onPointerUp = () => {
      handle.removeEventListener('pointermove', onPointerMove)
      handle.removeEventListener('pointerup', onPointerUp)
      setDragging(false)
      Methods.workspace_set_side_bar(size, collapsed).then(raw => setWorkspace(resolve(raw)))
    }

    handle.addEventListener('pointermove', onPointerMove)
    handle.addEventListener('pointerup', onPointerUp)
  }

  const onComposerHandlePointerDown = event => {
    if (!workspace) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    const startY = event.clientY
    const startSize = workspace.chatInputSize
    let size = startSize
    setDragging(true)

    const onPointerMove = move => {
      // dragging up grows the composer
      size = clamp(startSize + startY - move.clientY, CHAT_INPUT_SIZE_MIN, CHAT_INPUT_SIZE_MAX)
      setWorkspace(prev => ({ ...prev, chatInputSize: size }))
    }

    const onPointerUp = () => {
      handle.removeEventListener('pointermove', onPointerMove)
      handle.removeEventListener('pointerup', onPointerUp)
      setDragging(false)
      Methods.workspace_set_chat_input_size(size).then(raw => setWorkspace(resolve(raw)))
    }

    handle.addEventListener('pointermove', onPointerMove)
    handle.addEventListener('pointerup', onPointerUp)
  }

  return {
    ready: workspace !== null,
    chatInputSize: workspace?.chatInputSize ?? CHAT_INPUT_SIZE_DEFAULT,
    sideBarSize: workspace?.sideBarSize ?? SIDE_BAR_SIZE_DEFAULT,
    sideBarCollapsed: workspace?.sideBarCollapsed ?? false,
    dragging,
    toggleSidebar,
    onSidebarHandlePointerDown,
    onComposerHandlePointerDown,
  }
}

// Rust keeps the value as sent; bounds are a UI shell policy
function clamp(value, min, max) {
  return Math.round(Math.min(max, Math.max(min, value)))
}

function resolve(raw) {
  return {
    chatInputSize: raw.chat_input_size ?? CHAT_INPUT_SIZE_DEFAULT,
    sideBarSize: raw.side_bar_size ?? SIDE_BAR_SIZE_DEFAULT,
    sideBarCollapsed: raw.side_bar_collapsed ?? false,
  }
}
