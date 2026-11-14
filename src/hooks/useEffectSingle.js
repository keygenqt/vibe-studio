/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks']
 * INFO: A mount effect that runs once: enabled flag and in-flight guard per key set.
 */
import * as React from 'react'

export function useEffectSingle({ keys = [], enabled = true, callback }) {
  // the in-flight request per key set: repeated effect runs share one call
  const running = React.useRef({})
  const latest = React.useRef(callback)
  const slot = JSON.stringify(Array.isArray(keys) ? keys : [keys])

  React.useEffect(() => {
    latest.current = callback
  }, [callback])

  React.useEffect(() => {
    if (!enabled || running.current[slot]) return
    running.current[slot] = Promise.resolve()
      .then(() => latest.current())
      .finally(() => {
        delete running.current[slot]
      })
  }, [enabled, slot])
}
