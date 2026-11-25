// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: The binary entry point: launches the Tauri app.

// Prevents an additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Safe: main thread, before any threads and GTK/WebKit init
    unsafe { std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1") };

    vibe_studio::run()
}
