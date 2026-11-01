// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The settings table: the user preferences as a single row.

use anyhow::Result;
use diesel::prelude::*;

use crate::Store;

const SETTINGS_ID: i32 = 1;

/// Defaults for a missing row.
const DEFAULT_APPEARANCE_THEME: &str = "system";
const DEFAULT_APPEARANCE_LOCALE: &str = "ru";

/// User preferences: appearance, interface task models, chat and
/// translation behavior, notifications. A single row (id = 1); a
/// missing row falls back to `Default`. Preference fields are
/// `Option` — `None` = the user has not touched it, the UI applies
/// its own default.
#[derive(Debug, Clone, PartialEq, Queryable, Identifiable, Selectable, serde::Serialize, serde::Deserialize)]
#[diesel(table_name = settings)]
#[serde(default)]
pub struct SettingsData {
    /// Row id — the single row is 1, JS never sees it.
    #[serde(skip)]
    pub id: i32,
    /// Theme id: `"system"` tracks the OS, `"light"` / `"dark"` are explicit.
    pub appearance_theme: String,
    /// UI locale: `"ru"`, `"en"`, `"cn"`.
    pub appearance_locale: String,
    /// Accent color as a hex string, e.g. "#1b7f5c"; the palette is UI-owned.
    pub appearance_accent: Option<String>,
    /// Chat message font size, px.
    pub appearance_chat_font_size: Option<i32>,
    /// Model for light interface tasks, id from `models`.
    pub tasks_model_light: Option<i32>,
    /// Model for heavy interface tasks, id from `models`.
    pub tasks_model_heavy: Option<i32>,
    /// Streaming output of the chat answers.
    pub chat_streaming: Option<bool>,
    /// How many recent messages are kept in each chat.
    pub chat_keep_messages: Option<i32>,
    /// Model for chat translation, id from `models`.
    pub translation_model: Option<i32>,
    /// Locale the composer text is translated into.
    pub translation_mine: Option<String>,
    /// Locale the model answer is translated into.
    pub translation_answers: Option<String>,
    /// Background notification when an answer arrives.
    pub notifications_ready: Option<bool>,
    /// Background notification when a new app version is released.
    pub notifications_updates: Option<bool>,
}

impl Default for SettingsData {
    /// Fresh preferences: system theme, ru locale, nothing touched.
    fn default() -> Self {
        Self {
            id: SETTINGS_ID,
            appearance_theme: DEFAULT_APPEARANCE_THEME.to_string(),
            appearance_locale: DEFAULT_APPEARANCE_LOCALE.to_string(),
            appearance_accent: None,
            appearance_chat_font_size: None,
            tasks_model_light: None,
            tasks_model_heavy: None,
            translation_model: None,
            translation_mine: None,
            translation_answers: None,
            chat_streaming: None,
            chat_keep_messages: None,
            notifications_ready: None,
            notifications_updates: None,
        }
    }
}

/// Insert or update values: the id is owned by SQLite.
#[derive(Debug, Clone, Insertable, AsChangeset)]
#[diesel(table_name = settings)]
struct SettingsNewData {
    appearance_theme: String,
    appearance_locale: String,
    appearance_accent: Option<String>,
    appearance_chat_font_size: Option<i32>,
    tasks_model_light: Option<i32>,
    tasks_model_heavy: Option<i32>,
    translation_model: Option<i32>,
    translation_mine: Option<String>,
    translation_answers: Option<String>,
    chat_streaming: Option<bool>,
    chat_keep_messages: Option<i32>,
    notifications_ready: Option<bool>,
    notifications_updates: Option<bool>,
}

/// Drops the id: insert and update values never carry it.
impl From<&SettingsData> for SettingsNewData {
    fn from(data: &SettingsData) -> Self {
        SettingsNewData {
            appearance_theme: data.appearance_theme.clone(),
            appearance_locale: data.appearance_locale.clone(),
            appearance_accent: data.appearance_accent.clone(),
            appearance_chat_font_size: data.appearance_chat_font_size,
            tasks_model_light: data.tasks_model_light,
            tasks_model_heavy: data.tasks_model_heavy,
            translation_model: data.translation_model,
            translation_mine: data.translation_mine.clone(),
            translation_answers: data.translation_answers.clone(),
            chat_streaming: data.chat_streaming,
            chat_keep_messages: data.chat_keep_messages,
            notifications_ready: data.notifications_ready,
            notifications_updates: data.notifications_updates,
        }
    }
}

diesel::table! {
    settings (id) {
        id -> Integer,
        appearance_theme -> Text,
        appearance_locale -> Text,
        appearance_accent -> Nullable<Text>,
        appearance_chat_font_size -> Nullable<Integer>,
        tasks_model_light -> Nullable<Integer>,
        tasks_model_heavy -> Nullable<Integer>,
        chat_streaming -> Nullable<Bool>,
        chat_keep_messages -> Nullable<Integer>,
        translation_model -> Nullable<Integer>,
        translation_mine -> Nullable<Text>,
        translation_answers -> Nullable<Text>,
        notifications_ready -> Nullable<Bool>,
        notifications_updates -> Nullable<Bool>,
    }
}

impl Store {
    /// Loads the user preferences; a missing row falls back to
    /// `Default`. A model id whose model is gone reads as `NULL` —
    /// the feature turns off.
    pub(crate) fn get_settings(&self) -> Result<SettingsData> {
        let mut settings: SettingsData = self.find_by_id(settings::table, SETTINGS_ID)?.unwrap_or_default();
        for id in [
            &mut settings.tasks_model_light,
            &mut settings.tasks_model_heavy,
            &mut settings.translation_model,
        ] {
            if let Some(model_id) = *id {
                if self.get_provider_model(model_id).is_err() {
                    *id = None;
                }
            }
        }
        Ok(settings)
    }

    /// Persists the user preferences as the single row, returns it.
    pub(crate) fn save_settings(&self, settings: &SettingsData) -> Result<SettingsData> {
        let values = SettingsNewData::from(settings);
        self.save(settings::table, Some(SETTINGS_ID), values)
    }
}
