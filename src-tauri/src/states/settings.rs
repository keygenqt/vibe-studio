// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme']

use tauri::State;
use tauri::WebviewWindow;

use vibe_core::AppState;
use vibe_core::StateView;
use vibe_core::Store;
use vibe_core::ThemeChoice;
use vibe_core::settings_save;

use crate::states::view;

#[tauri::command]
pub fn state_snapshot(state: State<AppState>) -> StateView {
    view::view(&state)
}

/// theme: persisted choice; `system` means follow the OS
#[tauri::command]
pub fn settings_set_theme(
    window: WebviewWindow,
    state: State<AppState>,
    store: State<Store>,
    theme: ThemeChoice,
) -> Result<StateView, String> {
    let snapshot = {
        let mut settings = state.settings.lock().unwrap();
        settings.theme = theme;
        settings.clone()
    };
    settings_save(&store, &snapshot).map_err(|e| e.to_string())?;
    let result = view::view(&state);
    view::emit_state(&window, result.clone());
    Ok(result)
}
