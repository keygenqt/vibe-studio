/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Workspace writes: the background save writer and shell mutations.
 */
import store from '../store'
import {
  chatInputSizeSet,
  errorsClean,
  errorsCleanAll,
  sideBarCollapsedSet,
  sideBarSizeSet,
  workspaceSaveFail,
  workspaceSaveFinish,
  workspaceSaveStart,
} from './store'
import { WorkspaceTauri } from './tauri'

const wire = state => ({
  window_width: state.window_width,
  window_height: state.window_height,
  chat_input_size: state.chat_input_size,
  side_bar_size: state.side_bar_size,
  side_bar_collapsed: state.side_bar_collapsed,
})

const equal = (left, right) => Object.keys(left).every(key => left[key] === right[key])

const workspaceState = () => store.getState().workspace

let saving = null

// one writer: changes accumulated during a request produce one follow-up save
const synchronize = () => {
  if (saving !== null) return saving

  saving = (async () => {
    if (!workspaceState().ready) return true

    while (true) {
      const snapshot = wire(workspaceState())
      store.dispatch(workspaceSaveStart(snapshot))

      try {
        await WorkspaceTauri.save(snapshot)
      } catch (error) {
        store.dispatch(workspaceSaveFail(String(error)))
        return false
      }

      if (equal(snapshot, wire(workspaceState()))) {
        store.dispatch(workspaceSaveFinish())
        return true
      }
    }
  })().finally(() => {
    saving = null
  })

  return saving
}

export const WorkspaceMethod = {
  setSideBarSize: function (size) {
    if (!workspaceState().ready) return
    store.dispatch(sideBarSizeSet(size))
    return synchronize()
  },
  setChatInputSize: function (size) {
    if (!workspaceState().ready) return
    store.dispatch(chatInputSizeSet(size))
    return synchronize()
  },
  toggleSidebar: function () {
    const state = workspaceState()
    if (!state.ready) return
    store.dispatch(sideBarCollapsedSet(!state.side_bar_collapsed))
    return synchronize()
  },
  flush: function () {
    return synchronize()
  },
  cleanError: function (key) {
    store.dispatch(key ? errorsClean(key) : errorsCleanAll())
  },
}
