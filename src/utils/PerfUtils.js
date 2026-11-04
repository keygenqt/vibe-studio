/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['misc']
 * INFO: Dev-only perf marks: the slow spots land in the Rust log.
 */
import { debug } from '@tauri-apps/plugin-log'

// dev-only by the build itself — no runtime gate, no race with the app copy
const enabled = () => import.meta.env.DEV

export const Perf = {
  // logs a measurement: `ms` rounds, `null` marks a plain event
  log: (label, ms, extra = '') => {
    if (!enabled()) return
    const time = ms === null ? '' : ` ${Math.round(ms)}ms`
    debug(`[perf] ${label}${time}${extra ? ` ${extra}` : ''}`)
  },
}
