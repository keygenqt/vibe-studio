/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['misc']
 */

// Single entry for navigation. Pushes are journaled with their history
// position. openWithReplace without `route` replaces the current entry;
// with `route` it first collapses the drill-down down to the section
// anchor, so the stack stays [origin, S/<current>] and a plain back
// always lands one level up. backTo exits the whole section: it jumps
// below the anchor — where that section was opened from. The journal
// resets on reload; backTo then degrades to a one-step back. All history
// movement must go through this module — nothing else keeps it true.

const journal = [] // pushed entries: { path, at }, `at` is the history position

// the history position of the current entry; the initial page is 0 and not journaled
function currentAt() {
  return journal.length > 0 ? journal[journal.length - 1].at : 0
}

export const AppNav = {
  // push a new history entry, remembered for backTo
  open: (navigate, path, arg = {}) => {
    journal.push({ path: path, at: currentAt() + 1 })
    return navigate(path, arg)
  },

  // replace the current history entry, does not grow the stack;
  // with `route` — first collapse the drill-down above the section anchor
  openWithReplace: (navigate, path, route) => {
    // flat case: rewrite the current entry in place
    if (route === undefined) {
      if (journal.length > 0) {
        journal[journal.length - 1].path = path
      }
      return navigate(path, { replace: true })
    }
    // the anchor is the earliest journaled entry under the route
    let anchor = -1
    for (let i = 0; i < journal.length; i++) {
      if (journal[i].path.startsWith(route)) {
        anchor = i
        break
      }
    }
    if (anchor === -1) {
      return AppNav.openWithReplace(navigate, path)
    }
    const delta = journal.length - (anchor + 1)
    journal.length = anchor + 1
    journal[anchor].path = path
    if (delta === 0) {
      return navigate(path, { replace: true })
    }
    // go back over the drill-down, then rewrite the anchor slot;
    // go is async — the replace must wait for the pop to land
    return Promise.resolve(navigate(-delta)).then(() => navigate(path, { replace: true }))
  },

  // one step back
  back: navigate => {
    journal.pop()
    return navigate(-1)
  },

  // exit the section opened at the route: jump below its anchor entry
  backTo: (navigate, route) => {
    for (let i = 0; i < journal.length; i++) {
      if (journal[i].path.startsWith(route)) {
        const target = journal[i].at - 1
        const delta = currentAt() - target
        journal.length = i // the anchor and everything above it are stale forward entries
        if (delta > 0) {
          return navigate(-delta)
        }
        return undefined
      }
    }
    return navigate(-1)
  },
}
