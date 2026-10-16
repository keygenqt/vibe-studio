// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use tauri::Emitter;
use tauri::WebviewWindow;

use vibe_core::state::AppState;
use vibe_core::state::StateView;
use vibe_core::state::Theme;

fn system_theme(window: &WebviewWindow) -> Theme {
    match window.theme() {
        Ok(tauri::Theme::Dark) => Theme::Dark,
        _ => Theme::Light,
    }
}

/// Full state view. Main thread only: window.theme() dispatches
/// to the macOS main loop and hangs from other threads.
pub fn view(window: &WebviewWindow, state: &AppState) -> StateView {
    let settings = state.settings.lock().unwrap().clone();
    StateView {
        theme: vibe_core::theme::resolve(settings.theme, system_theme(window)),
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
