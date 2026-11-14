/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks']
 * INFO: Native pointerup subscription for an element or a React ref.
 */
import * as React from 'react'

export function usePointerUp({ target, enabled = true, onEvent }) {
  const callback = React.useRef(onEvent)

  React.useEffect(() => {
    callback.current = onEvent
  }, [onEvent])

  React.useEffect(() => {
    const element = target?.current ?? target
    if (!enabled || !element) return

    const listener = event => callback.current(event)
    element.addEventListener('pointerup', listener)
    return () => element.removeEventListener('pointerup', listener)
  }, [target, enabled])
}
