// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use serde::de::DeserializeOwned;

use crate::Store;

/// Persisted application state. Rust owns it, UI mirrors it.
pub trait Storable: serde::Serialize + DeserializeOwned + Default {
    const KEY: &'static str;

    /// Falls back to Default when the key is missing or malformed.
    fn load(store: &Store) -> Self {
        match store.get_raw(Self::KEY) {
            Ok(Some(data)) => serde_json::from_str(&data).unwrap_or_default(),
            _ => Self::default(),
        }
    }

    fn save(&self, store: &Store) -> Result<(), anyhow::Error> {
        store.set_raw(Self::KEY, &serde_json::to_string(self)?)
    }
}
