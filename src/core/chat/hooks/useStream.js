/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chat stream read: the growing answer of the routed chat.
 */
import { useSelector } from 'react-redux'

export function useStream(chatId) {
  const stream = useSelector(s => (s.chat.stream?.chatId === chatId ? s.chat.stream : null))

  return {
    stream,
    streaming: stream !== null,
  }
}
