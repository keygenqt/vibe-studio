/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */

// scroll positions are a pure UI detail — module map, no re-renders
const positions = new Map()

// watches every .ScrollArea in the document: toggles ScrollAreaPadded
// while content overflows vertically, keeps scrollTop by data-scroll-key
export function initScrollArea() {
  const watched = new Map()
  const pending = new Map()
  let raf = 0

  const check = (el, state) => {
    // data-scroll-static: scrollable, but the padding toggle disturbs
    // foreign layout observers (textarea autosize) — leave its padding alone
    const padded = el.scrollHeight > el.clientHeight && el.dataset.scrollStatic === undefined
    el.classList.toggle('ScrollAreaPadded', padded)
    // restore until the user scrolls themselves — content may mount late
    if (state.key !== undefined && !state.touched) {
      el.scrollTop = positions.get(state.key) ?? 0
    }
  }

  // every DOM write lands here: one batch per frame, outside the measure
  // phases — RO delivery and mutation microtasks stay read-only
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
    const state = { key: el.dataset.scrollKey, touched: false }
    state.onScroll = () => {
      state.touched = true
      if (state.key !== undefined) positions.set(state.key, el.scrollTop)
    }
    el.addEventListener('scroll', state.onScroll, { passive: true })
    resize.observe(el)
    watched.set(el, state)
    queue(el, state)
  }

  const forget = el => {
    const state = watched.get(el)
    if (!state) return
    el.removeEventListener('scroll', state.onScroll)
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
      // content changed inside an already mounted scroll area
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
