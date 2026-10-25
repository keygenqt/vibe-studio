// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use anyhow::Result;
use diesel::prelude::*;

use crate::Store;
use crate::constants;

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

/// A model of a provider catalog: sync-owned facts next to the
/// user-owned config. Config NULLs in the row resolve to the
/// `MODEL_*_DEFAULT` constants on read.
#[derive(Debug, Clone, serde::Serialize)]
pub struct Model {
    pub id: i32,
    pub provider_id: i32,
    /// Model name as the provider addresses it — the call key.
    pub name: String,
    // sync-owned: overwritten by every sync
    /// Approximate parameter count label, e.g. "8.0B".
    pub params: Option<String>,
    /// Tri-state facts; None = the provider did not say.
    pub vision: Option<bool>,
    pub tools: Option<bool>,
    /// Ollama `thinking`.
    pub reasoning: Option<bool>,
    /// No provider fills it yet — reserved for future facts.
    pub web: Option<bool>,
    // user-owned: sync never touches them
    /// Display title; None = the UI derives it from `name`.
    pub display_name: Option<String>,
    pub system_prompt: String,
    pub temperature: f64,
    pub seed: i64,
    pub num_ctx: i32,
    pub num_predict: i32,
}

/// User-owned config for `model_save`; the id travels separately.
#[derive(Debug, Clone, serde::Deserialize)]
pub struct ModelConfig {
    pub display_name: Option<String>,
    pub system_prompt: String,
    pub temperature: f64,
    pub seed: i64,
    pub num_ctx: i32,
    pub num_predict: i32,
}

/// Provider-reported facts of one model for `models_sync`.
#[derive(Debug, Clone)]
pub struct ModelFacts {
    pub name: String,
    pub params: Option<String>,
    pub vision: Option<bool>,
    pub tools: Option<bool>,
    pub reasoning: Option<bool>,
    pub web: Option<bool>,
}

/// Row as stored: config NULLs mean "not set yet" — resolved in `From`.
#[derive(Debug, Queryable, Selectable)]
#[diesel(table_name = models)]
struct ModelRow {
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

impl From<ModelRow> for Model {
    fn from(row: ModelRow) -> Self {
        Self {
            id: row.id,
            provider_id: row.provider_id,
            name: row.name,
            params: row.params,
            vision: row.vision,
            tools: row.tools,
            reasoning: row.reasoning,
            web: row.web,
            display_name: row.display_name,
            system_prompt: row.system_prompt.unwrap_or_default(),
            temperature: row.temperature.unwrap_or(constants::MODEL_TEMPERATURE_DEFAULT),
            seed: row.seed.unwrap_or(constants::MODEL_SEED_DEFAULT),
            num_ctx: row.num_ctx.unwrap_or(constants::MODEL_NUM_CTX_DEFAULT),
            num_predict: row.num_predict.unwrap_or(constants::MODEL_NUM_PREDICT_DEFAULT),
        }
    }
}

/// Sync-insert values: sync-owned columns only — user-owned stay NULL
/// / DEFAULT 0 on a fresh row.
#[derive(Debug, Insertable)]
#[diesel(table_name = models)]
struct ModelFactsInsert {
    provider_id: i32,
    name: String,
    params: Option<String>,
    vision: Option<bool>,
    tools: Option<bool>,
    reasoning: Option<bool>,
    web: Option<bool>,
}

impl ModelFactsInsert {
    fn from_facts(provider_id: i32, fact: &ModelFacts) -> Self {
        Self {
            provider_id,
            name: fact.name.clone(),
            params: fact.params.clone(),
            vision: fact.vision,
            tools: fact.tools,
            reasoning: fact.reasoning,
            web: fact.web,
        }
    }
}

impl Store {
    /// All models of a provider, ordered by name.
    pub fn models_list(&self, provider_id: i32) -> Result<Vec<Model>> {
        let mut conn = self.lock();
        Ok(models::table
            .filter(models::provider_id.eq(provider_id))
            .order(models::name)
            .select(ModelRow::as_select())
            .load(&mut *conn)?
            .into_iter()
            .map(Model::from)
            .collect())
    }

    /// Loads one model by id.
    pub fn model_load(&self, id: i32) -> Result<Model> {
        let mut conn = self.lock();
        Ok(models::table
            .find(id)
            .select(ModelRow::as_select())
            .first(&mut *conn)?
            .into())
    }

    /// Updates the user-owned config; sync-owned facts and `checked`
    /// stay as they are.
    pub fn model_save(&self, id: i32, config: &ModelConfig) -> Result<Model> {
        let mut conn = self.lock();
        diesel::update(models::table.find(id))
            .set((
                models::display_name.eq(config.display_name.clone()),
                models::system_prompt.eq(&config.system_prompt),
                models::temperature.eq(config.temperature),
                models::seed.eq(config.seed),
                models::num_ctx.eq(config.num_ctx),
                models::num_predict.eq(config.num_predict),
            ))
            .execute(&mut *conn)?;
        Ok(models::table
            .find(id)
            .select(ModelRow::as_select())
            .first(&mut *conn)?
            .into())
    }

    /// Persists the selection: every model in `checked` is upserted
    /// with fresh facts — the user-owned config survives an update, a
    /// new row starts with NULL config; models outside the selection
    /// are removed. A row in the table is a model chosen for chat.
    /// Runs in one transaction: a partial sync is worse than none.
    pub fn models_sync(&self, provider_id: i32, facts: &[ModelFacts], checked: &[String]) -> Result<()> {
        let mut conn = self.lock();
        conn.transaction::<(), diesel::result::Error, _>(|conn| {
            let selected: Vec<&str> = checked.iter().map(String::as_str).collect();
            for fact in facts {
                if !selected.contains(&fact.name.as_str()) {
                    continue;
                }
                // update-then-insert: diesel cannot type a composite
                // ON CONFLICT target for SQLite; the single guarded
                // writer makes the pair race-free
                let updated = diesel::update(
                    models::table
                        .filter(models::provider_id.eq(provider_id))
                        .filter(models::name.eq(&fact.name)),
                )
                .set((
                    models::params.eq(&fact.params),
                    models::vision.eq(fact.vision),
                    models::tools.eq(fact.tools),
                    models::reasoning.eq(fact.reasoning),
                    models::web.eq(fact.web),
                ))
                .execute(conn)?;
                if updated == 0 {
                    diesel::insert_into(models::table)
                        .values(ModelFactsInsert::from_facts(provider_id, fact))
                        .execute(conn)?;
                }
            }
            // drop everything the user unselected
            if checked.is_empty() {
                diesel::delete(models::table.filter(models::provider_id.eq(provider_id))).execute(conn)?;
            } else {
                diesel::delete(
                    models::table
                        .filter(models::provider_id.eq(provider_id))
                        .filter(models::name.ne_all(selected)),
                )
                .execute(conn)?;
            }
            Ok(())
        })?;
        Ok(())
    }
}
