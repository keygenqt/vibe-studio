// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The settings block: the user preferences.

//! The settings block functions over the user preferences row.

use anyhow::Result;

use studio_states::SettingsData;
use studio_states::Store;

/// Loads the user preferences; a missing row falls back to `Default`.
/// Stale model references arrive already resolved to `null` — the
/// states layer guarantees it. A store error yields the defaults —
/// loading never blocks the UI.
pub fn get_settings(store: &Store) -> SettingsData {
    studio_states::get_settings(store).unwrap_or_default()
}

/// Persists the user preferences as the single row. The UI is not
/// trusted: a set model id must exist, the context limit stays in
/// bounds; theme, locale and accent are stored as sent.
pub fn save_settings(store: &Store, settings: &SettingsData) -> Result<SettingsData> {
    for id in [
        settings.tasks_model_light,
        settings.tasks_model_heavy,
        settings.translation_model,
    ] {
        if let Some(id) = id {
            if studio_states::get_provider_model(store, id).is_err() {
                anyhow::bail!("Unknown model.");
            }
        }
    }
    if settings
        .chat_context_limit
        .is_some_and(|value| !(1..=2000).contains(&value))
    {
        anyhow::bail!("Context limit must be between 1 and 2000.");
    }
    studio_states::save_settings(store, settings)
}
