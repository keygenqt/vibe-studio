/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['misc']
 * INFO: The single navigation entry: journaled pushes and section back.
 */

// Single entry for navigation. All history movement goes through here.
// Pushes are journaled. Section pages remember their section route, so
// `back` from them jumps straight to the page the section was opened
// from — over the stale drill-down entries the replaces left below.
//
// Why the stale entries stay: the history API cannot delete entries
// below the current one without visiting them, and visiting paints
// every passed page — the flicker all go-and-replace schemes had. So
// section closing is logical only: replace rewrites the current slot,
// the journal tracks what the stack should mean, and `back` follows
// the journal, not the physical order. The garbage is bounded (one
// drill-down deep, no growth), self-cleans on the next push, and is
// reachable only by system Forward. After a reload the journal is
// empty and `back` degrades to a plain one-step back until the next
// push through this module.

// entries: { path, at, section? }, `at` is the history position
const journal = []

function currentAt() {
  return journal.length > 0 ? journal[journal.length - 1].at : 0
}

export const AppNav = {
  open: (navigate, path, arg = {}) => {
    journal.push({ path: path, at: currentAt() + 1 })
    return navigate(path, arg)
  },

  openWithReplace: (navigate, path, route) => {
    if (journal.length > 0) {
      const top = journal[journal.length - 1]
      top.path = path
      if (route !== undefined) {
        top.section = route
      }
    }
    return navigate(path, { replace: true })
  },

  back: navigate => {
    const current = journal[journal.length - 1]
    if (current?.section) {
      return AppNav.backTo(navigate, current.section)
    }
    journal.pop()
    return navigate(-1)
  },

  backTo: (navigate, route, force = false) => {
    let index = -1
    if (force) {
      for (let i = journal.length - 1; i >= 0; i--) {
        if (journal[i].path.startsWith(route)) {
          index = i
          break
        }
      }
    } else {
      for (let i = 0; i < journal.length; i++) {
        if (journal[i].path.startsWith(route)) {
          index = i
          break
        }
      }
    }
    if (index === -1) {
      journal.pop()
      return navigate(-1)
    }
    const count = currentAt() - (journal[index].at - 1)
    journal.length = index
    if (count > 0) {
      return navigate(-count)
    }
    return undefined
  },
}
