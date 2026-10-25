/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['states']
 */
import { invoke } from "@tauri-apps/api/core";

export const workspace = {
  workspace_get: async function () {
    return invoke("workspace_get", {});
  },
  workspace_set_chat_input_size: async function (value) {
    return invoke("workspace_set_chat_input_size", { value });
  },
  // size and collapsed travel together — toggle changes both
  workspace_set_side_bar: async function (size, collapsed) {
    return invoke("workspace_set_side_bar", { size, collapsed });
  },
  // theme: 'light' | 'dark' | 'system' ('system' = follow the OS)
  workspace_set_theme: async function (theme) {
    return invoke("workspace_set_theme", { theme });
  },
};
