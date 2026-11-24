/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: UI read: the pure front-end flags for render.
 */
import { useSelector } from 'react-redux'

export function useFormState() {
  const formState = useSelector(s => s.ui.formState)

  return {
    formState,
  }
}
