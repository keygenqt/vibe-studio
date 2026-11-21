// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The user preferences wire type, mirrored from studio-core.

use serde::Deserialize;
use serde::Serialize;

/// The user preferences served to the shell: the mirror of the core
/// row without its id — untouched values stay `None`.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(default)]
pub struct SettingsData {
    /// Theme id: `"system"` tracks the OS, `"light"` / `"dark"` are explicit.
    pub appearance_theme: String,
    /// UI locale: `"ru"`, `"en"`, `"cn"`.
    pub appearance_locale: String,
    /// Accent color as a hex string; `None` = not touched.
    pub appearance_accent: Option<String>,
    /// Chat message font size, px; `None` = not touched.
    pub appearance_chat_font_size: Option<i32>,
    /// Model for light interface tasks, id from `models`.
    pub tasks_model_light: Option<i32>,
    /// Model for heavy interface tasks, id from `models`.
    pub tasks_model_heavy: Option<i32>,
    /// Streaming output of the chat answers; `None` = not touched.
    pub chat_streaming: Option<bool>,
    /// Context limit of a chat, thousands of tokens; `None` = not touched.
    pub chat_context_limit: Option<i32>,
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
            appearance_theme: String::from("system"),
            appearance_locale: String::from("ru"),
            appearance_accent: None,
            appearance_chat_font_size: None,
            tasks_model_light: None,
            tasks_model_heavy: None,
            chat_streaming: None,
            chat_context_limit: None,
            translation_model: None,
            translation_mine: None,
            translation_answers: None,
            notifications_ready: None,
            notifications_updates: None,
        }
    }
}

impl From<studio_core::SettingsData> for SettingsData {
    fn from(data: studio_core::SettingsData) -> Self {
        Self {
            appearance_theme: data.appearance_theme,
            appearance_locale: data.appearance_locale,
            appearance_accent: data.appearance_accent,
            appearance_chat_font_size: data.appearance_chat_font_size,
            tasks_model_light: data.tasks_model_light,
            tasks_model_heavy: data.tasks_model_heavy,
            chat_streaming: data.chat_streaming,
            chat_context_limit: data.chat_context_limit,
            translation_model: data.translation_model,
            translation_mine: data.translation_mine,
            translation_answers: data.translation_answers,
            notifications_ready: data.notifications_ready,
            notifications_updates: data.notifications_updates,
        }
    }
}

impl From<&SettingsData> for studio_core::SettingsData {
    fn from(data: &SettingsData) -> Self {
        Self {
            appearance_theme: data.appearance_theme.clone(),
            appearance_locale: data.appearance_locale.clone(),
            appearance_accent: data.appearance_accent.clone(),
            appearance_chat_font_size: data.appearance_chat_font_size,
            tasks_model_light: data.tasks_model_light,
            tasks_model_heavy: data.tasks_model_heavy,
            chat_streaming: data.chat_streaming,
            chat_context_limit: data.chat_context_limit,
            translation_model: data.translation_model,
            translation_mine: data.translation_mine.clone(),
            translation_answers: data.translation_answers.clone(),
            notifications_ready: data.notifications_ready,
            notifications_updates: data.notifications_updates,
            // the single row id stays store-owned
            ..studio_core::SettingsData::default()
        }
    }
}
