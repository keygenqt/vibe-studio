// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme']
// INFO: App entry: Tauri builder setup — store, window, theme watcher, commands.

use tauri::Manager;

use studio_core::Store;
use studio_core::listen_system_theme;

use settings::data::theme_choice::ThemeChoice;

use crate::events::OkEmit;

mod app;
mod chat;
mod events;
mod groups_chat;
mod providers;
mod settings;
mod utils;
mod workspace;

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
            utils::window::restore(&window, &store);

            // OS theme changed — the system theme is a platform fact
            // on the settings channel; the UI resolves it against the
            // persisted choice itself.
            let theme_window = window.clone();
            listen_system_theme(move |theme| {
                let _ = OkEmit(&theme_window, ThemeChoice::from(theme));
            })?;

            // Window closed — persist its size.
            let handle = app.handle().clone();
            let closing = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { .. } = event {
                    let store = handle.state::<Store>();
                    let _ = utils::window::save(&closing, &store);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // app: shell actions and facts
            app::commands::init,
            app::commands::get_app_info,
            app::commands::clipboard_write_text,
            app::commands::clipboard_write_image,
            app::commands::clipboard_write_files,
            app::commands::clipboard_clear,
            app::commands::clipboard_read,
            app::commands::open_in_browser,
            app::commands::attachment_stat,
            // workspace: the shell environment
            workspace::commands::get_workspace,
            workspace::commands::save_workspace,
            // settings: the user preferences and the OS theme
            settings::commands::get_settings,
            settings::commands::save_settings,
            settings::commands::get_system_theme,
            // providers: providers, their models and defaults
            providers::commands::get_providers_catalog,
            providers::commands::get_providers,
            providers::commands::get_provider,
            providers::commands::save_provider,
            providers::commands::delete_provider,
            providers::commands::get_provider_models_by_type,
            providers::commands::get_provider_models,
            providers::commands::get_provider_model,
            providers::commands::get_model_defaults,
            providers::commands::save_provider_model,
            providers::commands::save_provider_models,
            // groups chat: groups, chats and their view state
            groups_chat::commands::get_groups_chat,
            groups_chat::commands::get_group_chat,
            groups_chat::commands::save_group_chat,
            groups_chat::commands::delete_group_chat,
            groups_chat::commands::get_chats,
            groups_chat::commands::save_chat,
            groups_chat::commands::delete_chat,
            groups_chat::commands::get_group_chat_histories,
            groups_chat::commands::set_group_chat_view,
            groups_chat::commands::select_group_chat,
            groups_chat::commands::chat_regenerate_name,
            // chat: history, streams and message mutations
            chat::commands::chat_get_history,
            chat::commands::chat_send_message,
            chat::commands::chat_cancel_send,
            chat::commands::chat_set_message_show_type,
            chat::commands::chat_set_message_collapsed,
            chat::commands::chat_delete_message,
            chat::commands::chat_resend_message,
            chat::commands::chat_translate_message,
            chat::commands::chat_compress_message,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            // Cmd+Q exits without a CloseRequested — persist here too.
            if let tauri::RunEvent::ExitRequested { .. } = event {
                if let Some(window) = app.get_webview_window("main") {
                    let store = app.state::<Store>();
                    let _ = utils::window::save(&window, &store);
                }
            }
        });
}
