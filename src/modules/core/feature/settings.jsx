/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { invoke } from "@tauri-apps/api/core";

export const settings = {
  state_snapshot: async function () {
    return invoke("state_snapshot", {});
  },
  // mode: 'light' | 'dark' | null (null = follow system)
  settings_set_theme: async function (mode) {
    return invoke("settings_set_theme", { theme: mode });
  },
};
