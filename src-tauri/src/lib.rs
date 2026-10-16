// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use tauri::Manager;
use tauri::WindowEvent;

use vibe_core::state::AppState;

mod feature;
mod tools;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .manage(AppState::default())
        .setup(|app| {
            // Restore state from disk — single source of truth
            let loaded = tools::storage::load(app.handle());
            *app.state::<AppState>().settings.lock().unwrap() = loaded;

            // System theme changed — re-emit resolved theme.
            // Guarded: with a manual override the resolved theme doesn't change,
            // and a full-state emit would still swap the settings object in Redux
            // and re-render selectors holding object references.
            let window = app.get_webview_window("main").unwrap();
            let listener = window.clone();
            let handle = app.handle().clone();
            window.on_window_event(move |event| {
                if let WindowEvent::ThemeChanged(_) = event {
                    let state = handle.state::<AppState>();
                    if state.settings.lock().unwrap().theme.is_none() {
                        let view = tools::theme::view(&listener, &state);
                        tools::theme::emit_state(&listener, view);
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // core
            feature::app_info::app_info,
            feature::settings::state_snapshot,
            feature::settings::settings_set_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
