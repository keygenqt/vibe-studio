/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Sidebar read: the size and the collapsed flag of the shell sidebar.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../../hooks'
import store from '../../store'
import { ERRORS, errorsSet, workspaceSet } from '../store'
import { WorkspaceTauri } from '../tauri'

export function useSidebar() {
  // the copy read: the shell slice
  const raw = useSelector(s => s.workspace)
  const errors = useSelector(s => s.workspace.errors)

  // the mount load: the shell copy lands in one payload for the whole block
  useEffectSingle({
    enabled: true,
    callback: () =>
      WorkspaceTauri.get()
        .then(value => store.dispatch(workspaceSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.sidebar]: String(error) }))),
  })

  return {
    sideBarSize: raw.sideBarSize,
    sideBarCollapsed: raw.sideBarCollapsed,
    errors,
  }
}
