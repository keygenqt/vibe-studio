/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 * INFO: Workspace writes: the background save and shell mutations.
 */
import store from '../store'
import {
  chatInputSizeSet,
  errorsClean,
  errorsCleanAll,
  errorsSet,
  ERRORS,
  sideBarCollapsedSet,
  sideBarSizeSet,
} from './store'
import { WorkspaceTauri } from './tauri'

// the copy is camelCase, the wire is snake_case
const wire = state => ({
  window_width: state.windowWidth,
  window_height: state.windowHeight,
  chat_input_size: state.chatInputSize,
  side_bar_size: state.sideBarSize,
  side_bar_collapsed: state.sideBarCollapsed,
})

// the save speaks through the errors map only: no error is a success
const save = () =>
  WorkspaceTauri.save(wire(store.getState().workspace)).catch(error =>
    store.dispatch(errorsSet({ [ERRORS.save]: String(error) }))
  )

export const WorkspaceMethod = {
  setSideBarSize: function (size) {
    store.dispatch(sideBarSizeSet(size))
    return save()
  },
  setChatInputSize: function (size) {
    store.dispatch(chatInputSizeSet(size))
    return save()
  },
  toggleSidebar: function () {
    store.dispatch(sideBarCollapsedSet(!store.getState().workspace.sideBarCollapsed))
    return save()
  },
  flush: function () {
    return save()
  },
  cleanError: function (key) {
    store.dispatch(key ? errorsClean(key) : errorsCleanAll())
  },
}
