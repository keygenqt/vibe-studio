/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['facts']
 * INFO: App Tauri commands.
 */
import { open } from '@tauri-apps/plugin-dialog'
import { invoke } from '@tauri-apps/api/core'

export const AppTauri = {
  init: async function () {
    return invoke('init', {})
  },
  getAppInfo: async function () {
    return invoke('get_app_info', {})
  },
  clipboardWriteText: async function (text) {
    return invoke('clipboard_write_text', { text })
  },
  clipboardWriteImage: async function (png) {
    return invoke('clipboard_write_image', { png })
  },
  clipboardWriteFiles: async function (paths) {
    return invoke('clipboard_write_files', { paths })
  },
  clipboardClear: async function () {
    return invoke('clipboard_clear', {})
  },
  clipboardRead: async function () {
    return invoke('clipboard_read', {})
  },
  dialogOpenFiles: async function () {
    return open({ multiple: true })
  },
  attachmentItems: async function (paths) {
    return invoke('attachment_items', { paths })
  },
  openInBrowser: async function (url) {
    return invoke('open_in_browser', { url })
  },
}
