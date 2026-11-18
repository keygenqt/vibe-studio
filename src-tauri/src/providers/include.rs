// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The providers command list: the chain entry of the invoke handler.

use tauri::ipc::Invoke;

use super::commands;

/// The command surface of the block: the chain entry.
pub(crate) fn handler() -> impl Fn(Invoke) -> bool + Send + Sync + 'static {
    tauri::generate_handler![
        commands::get_providers_catalog,
        commands::get_providers,
        commands::get_provider,
        commands::save_provider,
        commands::delete_provider,
        commands::get_provider_models,
        commands::get_provider_model,
        commands::get_model_defaults,
        commands::save_provider_model,
        commands::save_provider_models,
    ]
}
