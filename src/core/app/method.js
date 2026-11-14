/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['facts']
 * INFO: App writes: user actions and the form success flag.
 */
import store, { runMutation } from '../store'
import {
  ERRORS,
  errorsClean,
  errorsCleanAll,
  errorsSet,
  formSuccessClear,
  formSuccessSet,
} from './store'
import { AppTauri } from './tauri'

// the shared envelope bound to the block error actions
const catchError = (key, action) => runMutation({ errorsSet, errorsClean }, key, action)

export const AppMethod = {
  setFormSuccess: function (value) {
    store.dispatch(formSuccessSet(value))
  },
  clearFormSuccess: function () {
    store.dispatch(formSuccessClear())
  },
  clipboardWriteText: function (text) {
    return catchError(ERRORS.writeText, () => AppTauri.clipboardWriteText(text))
  },
  clipboardWriteImage: function (png) {
    return catchError(ERRORS.writeImage, () => AppTauri.clipboardWriteImage(png))
  },
  clipboardWriteFiles: function (paths) {
    return catchError(ERRORS.writeFiles, () => AppTauri.clipboardWriteFiles(paths))
  },
  clipboardClear: function () {
    return catchError(ERRORS.clipboardClear, () => AppTauri.clipboardClear())
  },
  clipboardRead: function () {
    return catchError(ERRORS.clipboardRead, () => AppTauri.clipboardRead())
  },
  dialogOpenFiles: function () {
    return catchError(ERRORS.openFiles, () => AppTauri.dialogOpenFiles())
  },
  attachmentStat: function (path) {
    return catchError(ERRORS.stat, () => AppTauri.attachmentStat(path))
  },
  openInBrowser: function (url) {
    return catchError(ERRORS.openBrowser, () => AppTauri.openInBrowser(url))
  },
  cleanError: function (key) {
    store.dispatch(key ? errorsClean(key) : errorsCleanAll())
  },
}
