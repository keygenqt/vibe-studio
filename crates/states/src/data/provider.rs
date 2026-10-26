// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use anyhow::anyhow;
use diesel::prelude::*;

use crate::Store;

/// A configured LLM provider connection. `id` is `None` until the
/// row is stored — SQLite owns the id.
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct ProviderData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// User-owned display name of the connection, e.g. "My Ollama".
    pub name: String,
    /// Provider kind as a plain string: "ollama", "deepseek", ...
    pub provider: String,
    /// API endpoint URL of the connection, e.g. "http://localhost:11434".
    pub host: String,
    /// API key for cloud providers; `None` = not needed (local Ollama).
    pub api_key: Option<String>,
}

diesel::table! {
    providers (id) {
        id -> Integer,
        name -> Text,
        provider -> Text,
        host -> Text,
        api_key -> Nullable<Text>,
    }
}

/// The stored row as diesel reads it; mapped to `ProviderData` on
/// the way out.
#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = providers)]
struct ProviderRow {
    id: i32,
    name: String,
    provider: String,
    host: String,
    api_key: Option<String>,
}

/// Insert or update values: the id is owned by SQLite.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = providers)]
struct ProviderNewData {
    name: String,
    provider: String,
    host: String,
    api_key: Option<String>,
}

/// Maps the stored row to the public type: the id becomes `Some`.
impl From<ProviderRow> for ProviderData {
    fn from(row: ProviderRow) -> Self {
        ProviderData {
            id: Some(row.id),
            name: row.name,
            provider: row.provider,
            host: row.host,
            api_key: row.api_key,
        }
    }
}

/// Drops the id: insert and update values never carry it.
impl From<&ProviderData> for ProviderNewData {
    fn from(data: &ProviderData) -> Self {
        ProviderNewData {
            name: data.name.clone(),
            provider: data.provider.clone(),
            host: data.host.clone(),
            api_key: data.api_key.clone(),
        }
    }
}

impl Store {
    /// All configured providers, in id order — `id` is the rowid
    /// alias, the table has no secondary indexes.
    pub(crate) fn get_providers(&self) -> Result<Vec<ProviderData>> {
        Ok(self
            .select::<_, ProviderRow>(providers::table)?
            .into_iter()
            .map(ProviderData::from)
            .collect())
    }

    /// Loads one provider by id.
    pub(crate) fn get_provider(&self, id: i32) -> Result<ProviderData> {
        self.find_by_id::<_, ProviderRow>(providers::table, id)?
            .map(ProviderData::from)
            .ok_or_else(|| anyhow!("Provider {id} not found."))
    }

    /// Inserts a new provider (`id = None`) or updates the one with
    /// the given id; returns the stored row.
    pub(crate) fn save_provider(&self, provider: &ProviderData) -> Result<ProviderData> {
        let values = ProviderNewData::from(provider);
        let row: ProviderRow = self.save(providers::table, provider.id, values)?;
        Ok(ProviderData::from(row))
    }

    /// Deletes the provider with the given id, returns affected rows.
    pub(crate) fn delete_provider(&self, id: i32) -> Result<usize> {
        self.delete(providers::table, id)
    }
}
