// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use diesel::prelude::*;

use crate::Store;

diesel::table! {
    providers (id) {
        id -> Integer,
        name -> Text,
        provider -> Text,
        host -> Text,
        api_key -> Nullable<Text>,
    }
}

/// A configured LLM provider connection.
#[derive(Debug, Clone, PartialEq, Queryable, Identifiable, Selectable, serde::Serialize, serde::Deserialize)]
#[diesel(table_name = providers)]
pub struct Provider {
    pub id: i32,
    pub name: String,
    /// Provider kind as a plain string: "ollama", "deepseek", ...
    pub provider: String,
    pub host: String,
    pub api_key: Option<String>,
}

/// Values for insert or update: the id is owned by SQLite.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = providers)]
pub struct ProviderNew {
    pub name: String,
    pub provider: String,
    pub host: String,
    pub api_key: Option<String>,
}

impl Store {
    /// All configured providers, ordered by id.
    pub fn providers_list(&self) -> Result<Vec<Provider>> {
        let mut conn = self.lock();
        Ok(providers::table
            .order(providers::id)
            .select(Provider::as_select())
            .load(&mut *conn)?)
    }

    /// Loads one provider by id.
    pub fn provider_load(&self, id: i32) -> Result<Provider> {
        let mut conn = self.lock();
        Ok(providers::table
            .find(id)
            .select(Provider::as_select())
            .first(&mut *conn)?)
    }

    /// Inserts a new provider or updates the one with the given id.
    pub fn provider_save(&self, id: Option<i32>, provider: &ProviderNew) -> Result<Provider> {
        let mut conn = self.lock();
        match id {
            Some(id) => {
                diesel::update(providers::table.find(id))
                    .set(provider)
                    .execute(&mut *conn)?;
                Ok(providers::table.find(id).first(&mut *conn)?)
            }
            None => {
                diesel::insert_into(providers::table)
                    .values(provider)
                    .execute(&mut *conn)?;
                // single guarded connection — the inserted row is the max id
                Ok(providers::table.order(providers::id.desc()).first(&mut *conn)?)
            }
        }
    }

    /// Deletes the provider with the given id, returns affected rows.
    pub fn provider_delete(&self, id: i32) -> Result<usize> {
        let mut conn = self.lock();
        Ok(diesel::delete(providers::table.find(id)).execute(&mut *conn)?)
    }
}
