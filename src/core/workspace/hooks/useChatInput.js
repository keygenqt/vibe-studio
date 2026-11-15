/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Chat input read: the composer size copy of the shell.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, errorsSet, workspaceSet } from '../store'
import { WorkspaceTauri } from '../tauri'

export function useChatInput() {
  // the copy read: the composer size of the shell
  const raw = useSelector(s => s.workspace)
  const errors = useSelector(s => s.workspace.errors)

  // the mount load: the shell copy lands in one payload for the whole block
  useEffectSingle({
    enabled: true,
    callback: () =>
      WorkspaceTauri.get()
        .then(value => store.dispatch(workspaceSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.chatInput]: String(error) }))),
  })

  return {
    chatInputSize: raw.chatInputSize,
    errors,
  }
}
