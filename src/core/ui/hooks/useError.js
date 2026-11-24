/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: UI read: the error toast text of the shell.
 */
import { useSelector } from 'react-redux'

export function useError() {
  const error = useSelector(s => s.ui.error)

  return {
    error,
  }
}
