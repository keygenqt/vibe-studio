// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use tauri::AppHandle;
use tauri::State;
use tauri::WebviewWindow;

use vibe_core::state::AppState;
use vibe_core::state::StateView;
use vibe_core::state::ThemeOverride;

use crate::tools::storage;
use crate::tools::theme;

#[tauri::command]
pub fn state_snapshot(window: WebviewWindow, state: State<AppState>) -> StateView {
    theme::view(&window, &state)
}

/// theme: Some(Light|Dark) — manual override, None — follow system
#[tauri::command]
pub fn settings_set_theme(
    app: AppHandle,
    window: WebviewWindow,
    state: State<AppState>,
    theme: Option<ThemeOverride>,
) -> Result<StateView, tauri::Error> {
    state.settings.lock().unwrap().theme = theme;
    let snapshot = state.settings.lock().unwrap().clone();
    storage::save(&app, &snapshot)?;
    let result = theme::view(&window, &state);
    theme::emit_state(&window, result.clone());
    Ok(result)
}
