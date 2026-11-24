/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Translation stream read: the growing translation of one message.
 */
import { useSelector } from 'react-redux'

export function useTranslate() {
  const translateStream = useSelector(s => s.chat.translateStream)

  return {
    translateStream,
    translating: translateStream !== null,
  }
}
