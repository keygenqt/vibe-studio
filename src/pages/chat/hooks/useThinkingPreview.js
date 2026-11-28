/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks']
 * INFO: Thinking preview: the last complete sentence, at most one change per second.
 */
import * as React from 'react'

import { AppUtils } from '../../../utils'

// The live preview of the growing thoughts: the first sentence lands
// at once, the next commits at most one per `delay` — the timer
// reads the freshest sentence at the fire, the ticks only refresh it.
export function useThinkingPreview(thinking, delay = 1500) {
  const [shown, setShown] = React.useState('')
  // the freshest computed sentence and the commit bookkeeping
  const latest = React.useRef('')
  const shownRef = React.useRef('')
  const lastCommit = React.useRef(0)
  const timer = React.useRef(null)

  React.useEffect(() => {
    const sentence = thinking ? AppUtils.lastSentence(thinking) : ''
    latest.current = sentence
    // nothing changed for the view
    if (sentence === shownRef.current) return
    // the empty input resets at once: the finished message must not
    // keep a stale preview
    if (!sentence) {
      if (timer.current !== null) clearTimeout(timer.current)
      timer.current = null
      shownRef.current = ''
      setShown('')
      return
    }
    const elapsed = Date.now() - lastCommit.current
    // the leading edge: nothing shown yet or the window has passed
    if (shownRef.current === '' || elapsed >= delay) {
      lastCommit.current = Date.now()
      shownRef.current = sentence
      setShown(sentence)
      return
    }
    // within the window: one timer holds the line, the fire commits
    // whatever sentence stands by then
    if (timer.current === null) {
      timer.current = setTimeout(() => {
        timer.current = null
        lastCommit.current = Date.now()
        shownRef.current = latest.current
        setShown(latest.current)
      }, delay - elapsed)
    }
  }, [thinking, delay])

  // the pending commit must not fire after the unmount
  React.useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current)
  }, [])

  return shown
}
