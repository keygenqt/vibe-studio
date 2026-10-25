// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme']

use tauri::Emitter;
use tauri::Manager;

use studio_core::Store;
use studio_core::listen_system_theme;

mod states;
mod tools;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .setup(|app| {
            // Restore state from disk — single source of truth
            let store = states::storage::store(app.handle())?;
            app.manage(store);

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

            // OS theme changed — the system theme is a platform fact
            // on its own channel; the UI resolves it against the
            // persisted choice itself.
            let handle = app.handle().clone();
            listen_system_theme({
                let handle = handle.clone();
                move |theme| {
                    let _ = handle.emit("event-theme", theme.as_str());
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
            states::react::workspace::workspace_get,
            states::react::workspace::workspace_set_chat_input_size,
            states::react::workspace::workspace_set_side_bar,
            states::react::workspace::workspace_set_theme,
            states::react::provider::providers_catalog,
            states::react::provider::providers_get,
            states::react::provider::provider_save,
            states::react::provider::provider_delete,
            states::react::models::models_get,
            states::react::models::model_get,
            states::react::models::model_save,
            states::react::models::models_sync,
            // tools
            tools::app_info::app_info,
            tools::models::provider_models,
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
