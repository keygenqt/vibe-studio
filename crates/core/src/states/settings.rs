// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use anyhow::Result;

use vibe_states::{Settings, Storable, Store};

/// Loads settings; missing or malformed data falls back to `Default`.
pub(crate) fn settings_load(store: &Store) -> Settings {
    Settings::load(store)
}

pub(crate) fn settings_save(store: &Store, settings: &Settings) -> Result<()> {
    settings.save(store)
}
