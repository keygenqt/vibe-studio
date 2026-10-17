// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use tauri::Emitter;
use tauri::WebviewWindow;

use vibe_core::AppState;
use vibe_core::StateView;
use vibe_core::resolve_theme;

/// Full state view with the persisted choice resolved to a concrete
/// theme.
pub fn view(state: &AppState) -> StateView {
    let settings = state.settings.lock().unwrap().clone();
    StateView {
        theme: resolve_theme(settings.theme),
        settings,
    }
}

/// Single state channel: any mutation ends with this emit.
/// The emit is spawned: it waits for the main thread, so calling it
/// from the main thread (command / window event) deadlocks.
pub fn emit_state(window: &WebviewWindow, view: StateView) {
    let window = window.clone();
    tauri::async_runtime::spawn(async move {
        let _ = window.emit("event-state", view);
    });
}
