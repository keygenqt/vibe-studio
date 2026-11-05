/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 * INFO: Watches ScrollArea elements: overflow padding, scroll memory and the follow mode.
 */

// scroll positions are a pure UI detail — module map, no re-renders
const positions = new Map()

// the follow mode (`data-scroll-follow`): the area pins to its bottom
// while the user sits at it and stays silent when they scroll away
const FOLLOW_THRESHOLD = 40

// the smooth flight cap: the flight state lives no longer than this,
// whatever the scroll events did on the way
const FLIGHT_MS = 1000

// the watched areas: module map — the components subscribe, no re-renders
const watched = new Map()

// the bottom watchers: key → the listener set of `watchBottom`
const bottomWatchers = new Map()

// the at-bottom flip: the listeners learn the fresh value
const setAtBottom = (state, value) => {
  if (state.atBottom === value) return
  state.atBottom = value
  const listeners = bottomWatchers.get(state.key)
  if (listeners) listeners.forEach(cb => cb(value))
}

// forces the follow area with the key to its bottom and re-arms the
// follow — the chat switch behind it
export function scrollToBottom(key) {
  watched.forEach(state => {
    if (state.key !== key) return
    setAtBottom(state, true)
    // the smooth flight: the flight state keeps the at-bottom flips
    // quiet on the way; the user input cancels the flight
    state.flightUntil = performance.now() + FLIGHT_MS
    state.el.scrollTo({ top: state.el.scrollHeight, behavior: 'smooth' })
  })
}

// resolves `true` while the key's area sits at the bottom; the
// callback fires on the flips only
export function watchBottom(key, cb) {
  if (!bottomWatchers.has(key)) bottomWatchers.set(key, new Set())
  const listeners = bottomWatchers.get(key)
  listeners.add(cb)
  const state = [...watched.values()].find(watched => watched.key === key)
  if (state) cb(state.atBottom)
  return () => listeners.delete(cb)
}

// watches every .ScrollArea in the document: toggles ScrollAreaPadded
// while content overflows vertically, keeps scrollTop by data-scroll-key,
// pins the follow areas to their bottom
export function initScrollArea() {
  const pending = new Map()
  let raf = 0

  const check = (el, state) => {
    const padded = el.scrollHeight > el.clientHeight && el.dataset.scrollStatic === undefined
    el.classList.toggle('ScrollAreaPadded', padded)
    if (state.follow) {
      // the follow mode: at-bottom areas pin before the paint — the
      // smooth flight owns the position until it lands
      const flying = state.flightUntil > performance.now()
      if (!flying && state.atBottom) el.scrollTop = el.scrollHeight
      return
    }
    if (state.key !== undefined && !state.touched) {
      el.scrollTop = positions.get(state.key) ?? 0
    }
  }

  const flush = () => {
    raf = 0
    pending.forEach((state, el) => check(el, state))
    pending.clear()
  }
  const queue = (el, state) => {
    if (!raf) raf = requestAnimationFrame(flush)
    pending.set(el, state)
  }

  const resize = new ResizeObserver(entries => {
    entries.forEach(entry => {
      const state = watched.get(entry.target)
      if (state) queue(entry.target, state)
    })
  })

  const watch = el => {
    if (watched.has(el)) return
    const state = {
      el,
      key: el.dataset.scrollKey,
      touched: false,
      follow: el.dataset.scrollFollow !== undefined,
      atBottom: true,
      flightUntil: 0,
    }
    // the user input cancels the smooth flight: the position is theirs
    state.cancelFlight = () => {
      state.flightUntil = 0
    }
    state.onScroll = () => {
      state.touched = true
      if (state.follow) {
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= FOLLOW_THRESHOLD
        // the flight: the intermediate positions change nothing, the
        // arrival clears it
        if (state.flightUntil > performance.now()) {
          if (atBottom) state.flightUntil = 0
          return
        }
        setAtBottom(state, atBottom)
      } else if (state.key !== undefined) {
        positions.set(state.key, el.scrollTop)
      }
    }
    el.addEventListener('scroll', state.onScroll, { passive: true })
    el.addEventListener('wheel', state.cancelFlight, { passive: true })
    el.addEventListener('pointerdown', state.cancelFlight, { passive: true })
    resize.observe(el)
    watched.set(el, state)
    queue(el, state)
  }

  const forget = el => {
    const state = watched.get(el)
    if (!state) return
    el.removeEventListener('scroll', state.onScroll)
    el.removeEventListener('wheel', state.cancelFlight)
    el.removeEventListener('pointerdown', state.cancelFlight)
    resize.unobserve(el)
    pending.delete(el)
    watched.delete(el)
  }

  const find = node => {
    if (!(node instanceof Element)) return []
    return node.classList.contains('ScrollArea')
      ? [node, ...node.querySelectorAll('.ScrollArea')]
      : [...node.querySelectorAll('.ScrollArea')]
  }

  const mutation = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(node => find(node).forEach(watch))
      m.removedNodes.forEach(node => find(node).forEach(forget))
      const target = m.target instanceof Element ? m.target : m.target?.parentElement
      const el = target?.closest('.ScrollArea')
      const state = el && watched.get(el)
      if (state) queue(el, state)
    })
  })
  mutation.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  })
  find(document.body).forEach(watch)
}
