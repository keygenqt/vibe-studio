// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use anyhow::anyhow;
use diesel::prelude::*;

use crate::Store;

/// Defaults for a missing row.
const DEFAULT_SYSTEM_PROMPT: &str = "";
const DEFAULT_TEMPERATURE: f64 = 0.7;
const DEFAULT_SEED: i64 = 42;
const DEFAULT_NUM_CTX: i32 = 4096;
const DEFAULT_NUM_PREDICT: i32 = 2048;

/// A model of a provider catalog. `id` is `None` until the row is
/// stored — SQLite owns the id. Config `None` means the user has not
/// touched it yet.
#[derive(Debug, Clone, PartialEq, Default, serde::Serialize, serde::Deserialize)]
pub struct ProviderModelData {
    /// Row id; `None` = not stored yet.
    pub id: Option<i32>,
    /// Id of the provider this model belongs to.
    pub provider_id: i32,
    /// Model name as the provider addresses it — the call key.
    pub name: String,
    /// Sync-owned: approximate parameter count label, e.g. "8.0B".
    pub params: Option<String>,
    /// Sync-owned tri-state: vision, `None` = the provider did not say.
    pub vision: Option<bool>,
    /// Sync-owned tri-state: tool calling, `None` = the provider did not say.
    pub tools: Option<bool>,
    /// Sync-owned tri-state: reasoning output (Ollama `thinking`).
    pub reasoning: Option<bool>,
    /// Sync-owned tri-state: web access; reserved, no provider fills it yet.
    pub web: Option<bool>,
    /// User-owned display title; `None` = the UI derives it from `name`.
    pub display_name: Option<String>,
    /// User-owned system prompt; `None` = not set yet, resolves to empty.
    pub system_prompt: Option<String>,
    /// User-owned sampling temperature; `None` = not set yet, resolves to 0.7.
    pub temperature: Option<f64>,
    /// User-owned sampling seed; `None` = not set yet, resolves to 42.
    pub seed: Option<i64>,
    /// User-owned context window, tokens; `None` = not set yet, resolves to 4096.
    pub num_ctx: Option<i32>,
    /// User-owned max tokens per generation; `None` = not set yet, resolves to 2048.
    pub num_predict: Option<i32>,
}

diesel::table! {
    models (id) {
        id -> Integer,
        provider_id -> Integer,
        name -> Text,
        params -> Nullable<Text>,
        vision -> Nullable<Bool>,
        tools -> Nullable<Bool>,
        reasoning -> Nullable<Bool>,
        web -> Nullable<Bool>,
        display_name -> Nullable<Text>,
        system_prompt -> Nullable<Text>,
        temperature -> Nullable<Double>,
        seed -> Nullable<BigInt>,
        num_ctx -> Nullable<Integer>,
        num_predict -> Nullable<Integer>,
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
    vision: Option<bool>,
    tools: Option<bool>,
    reasoning: Option<bool>,
    web: Option<bool>,
    display_name: Option<String>,
    system_prompt: Option<String>,
    temperature: Option<f64>,
    seed: Option<i64>,
    num_ctx: Option<i32>,
    num_predict: Option<i32>,
}

/// Insert or update values: the id is owned by SQLite.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = models)]
struct ProviderModelNewData {
    provider_id: i32,
    name: String,
    params: Option<String>,
    vision: Option<bool>,
    tools: Option<bool>,
    reasoning: Option<bool>,
    web: Option<bool>,
    display_name: Option<String>,
    system_prompt: Option<String>,
    temperature: Option<f64>,
    seed: Option<i64>,
    num_ctx: Option<i32>,
    num_predict: Option<i32>,
}

/// Maps the stored row to the public type: the id becomes `Some`,
/// untouched config resolves to the model defaults. The single
/// resolution point — every row leaving this file is full.
impl From<ProviderModelRow> for ProviderModelData {
    fn from(row: ProviderModelRow) -> Self {
        Self {
            id: Some(row.id),
            provider_id: row.provider_id,
            name: row.name,
            params: row.params,
            vision: row.vision,
            tools: row.tools,
            reasoning: row.reasoning,
            web: row.web,
            display_name: row.display_name,
            system_prompt: row.system_prompt.or_else(|| Some(DEFAULT_SYSTEM_PROMPT.to_string())),
            temperature: row.temperature.or(Some(DEFAULT_TEMPERATURE)),
            seed: row.seed.or(Some(DEFAULT_SEED)),
            num_ctx: row.num_ctx.or(Some(DEFAULT_NUM_CTX)),
            num_predict: row.num_predict.or(Some(DEFAULT_NUM_PREDICT)),
        }
    }
}

/// Drops the id: insert and update values never carry it.
impl From<&ProviderModelData> for ProviderModelNewData {
    fn from(data: &ProviderModelData) -> Self {
        ProviderModelNewData {
            provider_id: data.provider_id,
            name: data.name.clone(),
            params: data.params.clone(),
            vision: data.vision,
            tools: data.tools,
            reasoning: data.reasoning,
            web: data.web,
            display_name: data.display_name.clone(),
            system_prompt: data.system_prompt.clone(),
            temperature: data.temperature,
            seed: data.seed,
            num_ctx: data.num_ctx,
            num_predict: data.num_predict,
        }
    }
}

impl Store {
    /// All models, optionally of one provider — untouched config
    /// resolved to the model defaults. `None` takes the whole table:
    /// the read behind the providers block state.
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

    /// Loads one model by id, untouched config resolved to the
    /// model defaults.
    pub(crate) fn get_provider_model(&self, id: i32) -> Result<ProviderModelData> {
        self.find_by_id::<_, ProviderModelRow>(models::table, id)?
            .map(ProviderModelData::from)
            .ok_or_else(|| anyhow!("Model {id} not found."))
    }

    /// Inserts a new model (`id = None`) or updates the one with the
    /// given id; returns the stored row, untouched config resolved to
    /// the model defaults.
    pub(crate) fn save_provider_model(&self, model: &ProviderModelData) -> Result<ProviderModelData> {
        let row: ProviderModelRow = self.save(models::table, model.id, ProviderModelNewData::from(model))?;
        Ok(ProviderModelData::from(row))
    }

    /// Persists the selection: upserts the sync-owned facts of the
    /// given rows — the sync never carries config columns, so the
    /// user-owned config survives an update and a new row starts
    /// with NULL config; models of the provider outside the given
    /// set are removed. Returns the fresh list. One transaction: a
    /// partial sync is worse than none.
    pub(crate) fn save_provider_models(
        &self,
        provider_id: i32,
        models: &[ProviderModelData],
    ) -> Result<Vec<ProviderModelData>> {
        // raw id/name pairs: routes insert vs update by name, none of
        // the resolution here — the sync never carries config
        let stored: Vec<(i32, String)> = {
            let mut conn = self.lock();
            models::table
                .select((models::id, models::name))
                .filter(models::provider_id.eq(provider_id))
                .load(&mut *conn)?
        };
        let stored_ids: Vec<i32> = stored.iter().map(|(id, _)| *id).collect();

        let rows: Vec<(Option<i32>, ProviderModelNewData)> = models
            .iter()
            .map(|model| {
                let id = stored.iter().find(|(_, name)| name == &model.name).map(|(id, _)| *id);
                (id, ProviderModelNewData::from(model))
            })
            .collect();

        self.sync(models::table, &stored_ids, rows)?;
        self.get_provider_models(Some(provider_id))
    }
}
