/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { debug } from "@tauri-apps/plugin-log";

import { app_info } from "./feature/app_info";
import { settings } from "./feature/settings";

export const MethodsCore = {
  ...app_info,
  ...settings,
  log: function (message) {
    debug(message);
  },
};
