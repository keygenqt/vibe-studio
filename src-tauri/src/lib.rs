// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme']

use tauri::Manager;

use vibe_core::AppState;
use vibe_core::Store;
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

            // The window is built by hand (`create: false` in the
            // config) to show it only when the page is loaded.
            let config = app.config().app.windows.first().unwrap().clone();
            let window = tauri::WebviewWindowBuilder::from_config(app.handle(), &config)?
                .on_page_load(|window, payload| {
                    if matches!(payload.event(), tauri::webview::PageLoadEvent::Finished) {
                        let _ = window.show();
                    }
                })
                .build()?;

            // Window size from the workspace.
            let store = app.state::<Store>();
            states::tauri::workspace::restore(&window, &store);

            // OS theme changed — re-emit only while the choice is
            // `system`: a manual override ignores OS changes.
            let handle = app.handle().clone();
            listen_system_theme({
                let handle = handle.clone();
                let window = window.clone();
                move |_theme| {
                    let state = handle.state::<AppState>();
                    if state.settings.lock().unwrap().theme == ThemeChoice::System {
                        let view = states::react::view::view(&state);
                        states::react::view::emit_state(&window, view);
                    }
                }
            })?;

            // Window closed — persist its size.
            let closing = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    let store = handle.state::<Store>();
                    let _ = states::tauri::workspace::save(&closing, &store);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // states
            states::react::settings::state_snapshot,
            states::react::settings::settings_set_theme,
            states::react::workspace::workspace_get,
            states::react::workspace::workspace_set_chat_input_size,
            states::react::workspace::workspace_set_side_bar,
            // tools
            tools::app_info::app_info,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            // Cmd+Q exits without a CloseRequested — persist here too.
            if let tauri::RunEvent::ExitRequested { .. } = event {
                if let Some(window) = app.get_webview_window("main") {
                    let store = app.state::<Store>();
                    let _ = states::tauri::workspace::save(&window, &store);
                }
            }
        });
}
