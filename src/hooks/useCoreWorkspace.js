/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 */
import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import i18next from 'i18next'

import {
  CHAT_INPUT_SIZE_MAX,
  CHAT_INPUT_SIZE_MIN,
  SIDE_BAR_SIZE_MAX,
  SIDE_BAR_SIZE_MIN,
} from '../constants'
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

  React.useEffect(() => {
    if (raw.ready && i18next.language !== raw.locale) {
      i18next.changeLanguage(raw.locale)
    }
  }, [raw.ready, raw.locale])

  const wire = () => ({
    window_width: raw.window_width,
    window_height: raw.window_height,
    theme: raw.theme,
    locale: raw.locale,
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

  const setTheme = theme => {
    if (!raw.ready) return
    dispatch(workspaceSet({ theme }))
    Methods.save_workspace({ ...wire(), theme })
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
        base.side_bar_size + move.clientX - startX,
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
    let size = base.chat_input_size
    setDragging(true)

    const onPointerMove = move => {
      size = AppUtils.clamp(
        base.chat_input_size + startY - move.clientY,
        CHAT_INPUT_SIZE_MIN,
        CHAT_INPUT_SIZE_MAX
      )
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
    themeChoice: raw.theme,
    locale: raw.locale,
    dragging,
    chatInputSize: raw.chat_input_size,
    sideBarSize: raw.side_bar_size,
    sideBarCollapsed: raw.side_bar_collapsed,
    toggleSidebar,
    setTheme,
    onSidebarHandlePointerDown,
    onComposerHandlePointerDown,
  }
}
