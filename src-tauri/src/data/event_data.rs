// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use serde::Serialize;

/// Event producers — the key of the uniform `{key, value}` payload,
/// serialized to the producer's name (the command, or the Rust-side
/// watcher).
#[derive(Serialize, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) enum EventKey {
    Workspace,
    Providers,
    GroupsChat,
    Chat,
    SystemTheme,
}

/// Uniform event payload: the producer's key and the fresh data,
/// serialized to a JSON value — JS receives it already parsed.
#[derive(Serialize, Clone)]
pub(crate) struct EventData {
    pub(crate) key: EventKey,
    pub(crate) value: serde_json::Value,
}

impl EventData {
    /// Builds the payload: the value is serialized to a JSON value;
    /// a failure falls back to `Value::Null`.
    pub(crate) fn new<T: serde::Serialize>(key: EventKey, value: &T) -> Self {
        Self {
            key,
            value: serde_json::to_value(value).unwrap_or_default(),
        }
    }
}
