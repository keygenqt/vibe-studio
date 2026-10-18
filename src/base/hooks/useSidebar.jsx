/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 */
import * as React from 'react'

import { Methods } from '../../modules'

// Mirror of the vibe-states bounds — the truth is clamped on the
// Rust side, these are for visual feedback only
const SIDEBAR_WIDTH_MIN = 200
const SIDEBAR_WIDTH_MAX = 480
const SIDEBAR_WIDTH_DEFAULT = 260

/**
 * Sidebar state owner: loads once on mount, optimistic toggle,
 * live width while dragging, persisted once on release. State is
 * null until the stored truth arrives — render nothing before it.
 */
export function useSidebar() {
  const [sidebar, setSidebar] = React.useState(null)
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => {
    if (!window.isTauri) {
      setSidebar({ collapsed: false, width: SIDEBAR_WIDTH_DEFAULT })
      return undefined
    }
    let unmounted = false
    Methods.sidebar_get().then(value => {
      if (!unmounted) setSidebar(value)
    })
    return () => {
      unmounted = true
    }
  }, [])

  const toggle = () => {
    if (!sidebar) return
    setSidebar(prev => {
      if (!prev) return prev
      const next = { ...prev, collapsed: !prev.collapsed }
      Methods.sidebar_set(next.collapsed, next.width).then(setSidebar)
      return next
    })
  }

  const onHandlePointerDown = event => {
    if (!sidebar) return
    event.preventDefault()
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    const startX = event.clientX
    const startWidth = sidebar.width
    let width = startWidth
    const collapsed = sidebar.collapsed
    setDragging(true)

    const onPointerMove = move => {
      width = Math.round(
        Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, startWidth + move.clientX - startX))
      )
      setSidebar(prev => ({ ...prev, width }))
    }

    const onPointerUp = () => {
      handle.removeEventListener('pointermove', onPointerMove)
      handle.removeEventListener('pointerup', onPointerUp)
      setDragging(false)
      Methods.sidebar_set(collapsed, width).then(setSidebar)
    }

    handle.addEventListener('pointermove', onPointerMove)
    handle.addEventListener('pointerup', onPointerUp)
  }

  return {
    ready: sidebar !== null,
    collapsed: sidebar?.collapsed ?? false,
    width: sidebar?.width ?? SIDEBAR_WIDTH_DEFAULT,
    dragging,
    toggle,
    onHandlePointerDown,
  }
}
