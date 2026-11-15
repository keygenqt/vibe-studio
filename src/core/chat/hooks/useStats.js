/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chat stats read: the usage stats of the loaded chat.
 */
import { useSelector } from 'react-redux'

export function useStats() {
  // the copy read: stats arrive with the history payload, no mount load of its own
  const stats = useSelector(s => s.chat.stats)

  return {
    stats,
  }
}
