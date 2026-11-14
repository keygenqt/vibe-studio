/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['hooks', 'states']
 * INFO: Workspace read: the mount load and the shell copy for render.
 */
import { useSelector } from 'react-redux'

import { useEffectSingle } from '../../hooks'
import store from '../store'
import { ERRORS, errorsSet, workspaceSet } from './store'
import { WorkspaceTauri } from './tauri'

export function useWorkspace() {
  // the copy read: the whole shell slice, the fields are mapped on return
  const raw = useSelector(s => s.workspace)

  // the mount load: the shell copy is loaded once
  useEffectSingle({
    enabled: !raw.ready,
    callback: () =>
      WorkspaceTauri.get()
        .then(value => store.dispatch(workspaceSet(value)))
        .catch(error => store.dispatch(errorsSet({ [ERRORS.load]: String(error) }))),
  })

  return {
    ready: raw.ready,
    errors: raw.errors,
    windowWidth: raw.window_width,
    windowHeight: raw.window_height,
    theme: raw.theme,
    locale: raw.locale,
    chatInputSize: raw.chat_input_size,
    sideBarSize: raw.side_bar_size,
    sideBarCollapsed: raw.side_bar_collapsed,
    saving: raw.workspaceSave !== null,
    saveError: raw.workspaceSaveError,
  }
}
