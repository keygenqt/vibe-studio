// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme']
// INFO: App entry: Tauri builder setup — store, window, theme watcher, commands.

use tauri::Manager;

use studio_core::Store;
use studio_core::listen_system_theme;

use crate::data::event_data::EventData;
use crate::data::event_data::EventKey;
use crate::events::emit_event_app;

mod commands;
mod data;
mod events;
mod window;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .setup(|app| {
            // Restore state from disk — single source of truth
            let dir = app.path().app_data_dir()?;
            let store = studio_core::store_open(&dir)?;
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
            window::restore(&window, &store);

            // OS theme changed — the system theme is a platform fact
            // on its own channel; the UI resolves it against the
            // persisted choice itself.
            let handle = app.handle().clone();
            let theme_window = window.clone();
            listen_system_theme(move |theme| {
                emit_event_app(&theme_window, EventData::new(EventKey::SystemTheme, &theme));
            })?;

            // Window closed — persist its size.
            let closing = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    let store = handle.state::<Store>();
                    let _ = window::save(&closing, &store);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_workspace,
            commands::save_workspace,
            commands::get_providers_catalog,
            commands::get_providers,
            commands::get_provider,
            commands::save_provider,
            commands::delete_provider,
            commands::get_provider_models,
            commands::get_provider_model,
            commands::save_provider_model,
            commands::save_provider_models,
            commands::get_groups_chat,
            commands::get_group_chat,
            commands::save_group_chat,
            commands::delete_group_chat,
            commands::get_chats,
            commands::save_chat,
            commands::delete_chat,
            commands::get_group_chat_histories,
            commands::set_group_chat_view,
            commands::select_group_chat,
            commands::chat_get_history,
            commands::chat_send_message,
            commands::get_system_theme,
            commands::get_app_info,
            commands::get_provider_models_by_type,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            // Cmd+Q exits without a CloseRequested — persist here too.
            if let tauri::RunEvent::ExitRequested { .. } = event {
                if let Some(window) = app.get_webview_window("main") {
                    let store = app.state::<Store>();
                    let _ = window::save(&window, &store);
                }
            }
        });
}
