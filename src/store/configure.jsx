/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { configureStore } from "@reduxjs/toolkit";

import appStateReducer from "./impl/appState";

export default configureStore({
  reducer: {
    appState: appStateReducer,
  },
});
