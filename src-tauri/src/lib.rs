// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme']

use tauri::Manager;

use vibe_core::AppState;
use vibe_core::ThemeChoice;
use vibe_core::listen_system_theme;
use vibe_core::settings_load;

mod states;
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
            let store = states::storage::store(app.handle())?;
            let settings = settings_load(&store);
            app.manage(store);
            *app.state::<AppState>().settings.lock().unwrap() = settings;

            // OS theme changed — re-emit only while the choice is
            // `system`: a manual override ignores OS changes.
            let listener = app.get_webview_window("main").unwrap();
            let handle = app.handle().clone();
            listen_system_theme(move |_theme| {
                let state = handle.state::<AppState>();
                if state.settings.lock().unwrap().theme == ThemeChoice::System {
                    let view = states::view::view(&state);
                    states::view::emit_state(&listener, view);
                }
            })?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // states
            states::settings::state_snapshot,
            states::settings::settings_set_theme,
            states::workspace::workspace_get,
            states::workspace::workspace_set_chat_input_size,
            states::workspace::workspace_set_side_bar,
            // tools
            tools::app_info::app_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
