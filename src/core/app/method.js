/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['facts']
 * INFO: App writes: user actions over the Tauri commands.
 */
import { AppTauri } from './tauri'

export const AppMethod = {
  clipboardWriteText: function (text) {
    return AppTauri.clipboardWriteText(text)
  },
  clipboardWriteImage: function (png) {
    return AppTauri.clipboardWriteImage(png)
  },
  clipboardWriteFiles: function (paths) {
    return AppTauri.clipboardWriteFiles(paths)
  },
  clipboardClear: function () {
    return AppTauri.clipboardClear()
  },
  clipboardRead: function () {
    return AppTauri.clipboardRead()
  },
  dialogOpenFiles: function () {
    return AppTauri.dialogOpenFiles()
  },
  attachmentItems: function (paths) {
    return AppTauri.attachmentItems(paths)
  },
  openInBrowser: function (url) {
    return AppTauri.openInBrowser(url)
  },
}
