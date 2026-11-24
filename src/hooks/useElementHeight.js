/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks']
 * INFO: Measured height of an element: follows mounts and its own size changes.
 */
import * as React from 'react'

export function useElementHeight() {
  const [height, setHeight] = React.useState(null)
  const [node, setNode] = React.useState(null)

  // the callback ref fires when the element mounts — later than the
  // hook itself whenever a gate holds the render back
  const ref = React.useCallback(element => {
    setNode(element)
  }, [])

  React.useEffect(() => {
    if (!node) {
      setHeight(null)
      return
    }
    // the element owns its updates: layout, content, the window moves
    // that touch it — the observer delivers the first size on observe
    const observer = new ResizeObserver(() => {
      setHeight(node.offsetHeight)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return [ref, height]
}
