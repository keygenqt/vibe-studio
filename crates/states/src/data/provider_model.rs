// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The models table: provider catalog with sync-owned facts and user-owned config.

use anyhow::Result;
use anyhow::anyhow;
use diesel::prelude::*;

use crate::Store;

/// A model of a provider catalog. `id` is `None` until the row is
/// stored — SQLite owns the id. The config is filled at insert from
/// the defaults catalog — the stored row always carries it.
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct ProviderModelData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// Id of the provider this model belongs to.
    pub provider_id: i32,
    /// Model name as the provider addresses it — the call key.
    pub name: String,
    /// Sync-owned: approximate parameter count label, e.g. "8.0B".
    pub params: Option<String>,
    /// Sync-owned: context window in tokens the host reports.
    pub context_length: Option<i64>,
    /// Sync-owned capability matrix as a JSON document of the
    /// cluster's shape; `None` = the host said nothing.
    pub capabilities: Option<serde_json::Value>,
    /// User-owned display title; empty = the UI derives it from `name`.
    pub display_name: String,
    /// User-owned system prompt; empty = not set.
    pub system_prompt: String,
    /// Sampling temperature.
    pub temperature: f64,
    /// Sampling seed.
    pub seed: i64,
    /// Top-p nucleus sampling cutoff.
    pub top_p: f64,
    /// Top-k sampling cutoff.
    pub top_k: i32,
    /// Min-p sampling cutoff.
    pub min_p: f64,
    /// Stop sequences; empty = none.
    pub stop: Vec<String>,
    /// Context window, tokens.
    pub num_ctx: i32,
    /// Max tokens per generation.
    pub num_predict: i32,
    /// Reasoning depth: "low" | "high"; `None` = not sent, the
    /// provider default applies.
    pub effort: Option<String>,
    /// Cap on reasoning tokens (GigaChat); `None` = not sent.
    pub reasoning_max_tokens: Option<i32>,
    /// Think toggle (Ollama); `None` = not sent, the server default
    /// applies.
    pub think: Option<bool>,
}

diesel::table! {
    models (id) {
        id -> Integer,
        provider_id -> Integer,
        name -> Text,
        params -> Nullable<Text>,
        context_length -> Nullable<BigInt>,
        capabilities -> Nullable<Text>,
        display_name -> Text,
        system_prompt -> Text,
        temperature -> Double,
        seed -> BigInt,
        top_p -> Double,
        top_k -> Integer,
        min_p -> Double,
        stop -> Text,
        num_ctx -> Integer,
        num_predict -> Integer,
        effort -> Nullable<Text>,
        reasoning_max_tokens -> Nullable<Integer>,
        think -> Nullable<Bool>,
    }
}

/// The stored row as diesel reads it; mapped to `ProviderModelData`
/// on the way out.
#[derive(Debug, Clone, Queryable, Selectable)]
#[diesel(table_name = models)]
struct ProviderModelRow {
    id: i32,
    provider_id: i32,
    name: String,
    params: Option<String>,
    context_length: Option<i64>,
    capabilities: Option<String>,
    display_name: String,
    system_prompt: String,
    temperature: f64,
    seed: i64,
    top_p: f64,
    top_k: i32,
    min_p: f64,
    stop: String,
    num_ctx: i32,
    num_predict: i32,
    effort: Option<String>,
    reasoning_max_tokens: Option<i32>,
    think: Option<bool>,
}

/// Insert or update values: the id is owned by SQLite.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = models)]
struct ProviderModelNewData {
    provider_id: i32,
    name: String,
    params: Option<String>,
    context_length: Option<i64>,
    capabilities: Option<String>,
    display_name: String,
    system_prompt: String,
    temperature: f64,
    seed: i64,
    top_p: f64,
    top_k: i32,
    min_p: f64,
    stop: String,
    num_ctx: i32,
    num_predict: i32,
    effort: Option<String>,
    reasoning_max_tokens: Option<i32>,
    think: Option<bool>,
}

/// Maps the stored row to the public type. The single conversion
/// point — the stored row is the truth, nothing is resolved here.
impl From<ProviderModelRow> for ProviderModelData {
    fn from(row: ProviderModelRow) -> Self {
        Self {
            id: Some(row.id),
            provider_id: row.provider_id,
            name: row.name,
            params: row.params,
            context_length: row.context_length,
            capabilities: row.capabilities.and_then(|json| serde_json::from_str(&json).ok()),
            display_name: row.display_name,
            system_prompt: row.system_prompt,
            temperature: row.temperature,
            seed: row.seed,
            top_p: row.top_p,
            top_k: row.top_k,
            min_p: row.min_p,
            stop: serde_json::from_str(&row.stop).unwrap_or_default(),
            num_ctx: row.num_ctx,
            num_predict: row.num_predict,
            effort: row.effort,
            reasoning_max_tokens: row.reasoning_max_tokens,
            think: row.think,
        }
    }
}

/// Drops the id and serializes the list-typed fields: insert and
/// update values never carry the id.
impl From<&ProviderModelData> for ProviderModelNewData {
    fn from(data: &ProviderModelData) -> Self {
        ProviderModelNewData {
            provider_id: data.provider_id,
            name: data.name.clone(),
            params: data.params.clone(),
            context_length: data.context_length,
            capabilities: data
                .capabilities
                .as_ref()
                .and_then(|value| serde_json::to_string(value).ok()),
            display_name: data.display_name.clone(),
            system_prompt: data.system_prompt.clone(),
            temperature: data.temperature,
            seed: data.seed,
            top_p: data.top_p,
            top_k: data.top_k,
            min_p: data.min_p,
            stop: serde_json::to_string(&data.stop).unwrap_or_else(|_| String::from("[]")),
            num_ctx: data.num_ctx,
            num_predict: data.num_predict,
            effort: data.effort.clone(),
            reasoning_max_tokens: data.reasoning_max_tokens,
            think: data.think,
        }
    }
}

impl Store {
    /// All models, optionally of one provider. `None` takes the whole
    /// table: the read behind the providers block state.
    pub(crate) fn get_provider_models(&self, provider_id: Option<i32>) -> Result<Vec<ProviderModelData>> {
        let mut conn = self.lock();
        let rows: Vec<ProviderModelRow> = match provider_id {
            Some(provider_id) => models::table
                .filter(models::provider_id.eq(provider_id))
                .load(&mut *conn)?,
            None => models::table.load(&mut *conn)?,
        };
        Ok(rows.into_iter().map(ProviderModelData::from).collect())
    }

    /// Loads one model by id.
    pub(crate) fn get_provider_model(&self, id: i32) -> Result<ProviderModelData> {
        self.find_by_id::<_, ProviderModelRow>(models::table, id)?
            .map(ProviderModelData::from)
            .ok_or_else(|| anyhow!("Model {id} not found."))
    }

    /// Inserts a new model (`id = None`) or updates the one with the
    /// given id; returns the stored row.
    pub(crate) fn save_provider_model(&self, model: &ProviderModelData) -> Result<ProviderModelData> {
        let row: ProviderModelRow = self.save(models::table, model.id, ProviderModelNewData::from(model))?;
        Ok(ProviderModelData::from(row))
    }

    /// Persists the full model set of the provider: rows with ids
    /// update, `None` ids insert, the rest of the table is pruned.
    /// The caller owns the merge — this is a dumb write.
    /// Returns the fresh list.
    pub(crate) fn save_provider_models(
        &self,
        provider_id: i32,
        models: &[ProviderModelData],
    ) -> Result<Vec<ProviderModelData>> {
        let stored_ids: Vec<i32> = {
            let mut conn = self.lock();
            models::table
                .select(models::id)
                .filter(models::provider_id.eq(provider_id))
                .load(&mut *conn)?
        };
        let rows: Vec<(Option<i32>, ProviderModelNewData)> = models
            .iter()
            .map(|model| (model.id, ProviderModelNewData::from(model)))
            .collect();
        self.sync(models::table, &stored_ids, rows)?;
        self.get_provider_models(Some(provider_id))
    }
}
