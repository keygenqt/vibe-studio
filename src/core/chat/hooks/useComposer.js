/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Composer read: the draft and its attachments.
 */
import { useSelector } from 'react-redux'

export function useComposer() {
  // the copy read: the composer content, no mount load of its own
  const draft = useSelector(s => s.chat.draft)
  const chatAttachments = useSelector(s => s.chat.chatAttachments)

  return {
    draft,
    chatAttachments,
  }
}
