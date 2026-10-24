// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme']

use tauri::Emitter;
use tauri::WebviewWindow;

use studio_core::Workspace;

/// Single state channel: any mutation ends with this emit.
/// The emit is spawned: it waits for the main thread, so calling it
/// from the main thread (command / window event) deadlocks.
pub fn emit_state(window: &WebviewWindow, workspace: Workspace) {
    let window = window.clone();
    tauri::async_runtime::spawn(async move {
        let _ = window.emit("event-state", workspace);
    });
}
