// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states', 'theme']
// INFO: App entry: Tauri builder setup — store, window, theme watcher, commands.

use tauri::Manager;

use studio_core::Store;
use studio_core::listen_system_theme;

use crate::events::OkEmit;

mod app;
mod chat;
mod events;
mod groups_chat;
mod providers;
mod settings;
mod utils;
mod workspace;

/// Chains the block handlers: the first block that knows the
/// command answers it; the rest see no command at all.
macro_rules! handlers {
    ($($handler:path),* $(,)?) => {
        move |invoke: tauri::ipc::Invoke| {
            let mut invoke = Some(invoke);
            $(
                if let Some(inner) = invoke.take() {
                    if $handler()(inner) {
                        return true;
                    }
                }
            )*
            false
        }
    };
}

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
                let _ = OkEmit(&theme_window, theme);
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
        .invoke_handler(handlers![
            app::include::handler,
            workspace::include::handler,
            settings::include::handler,
            providers::include::handler,
            groups_chat::include::handler,
            chat::include::handler,
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
