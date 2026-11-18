// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The uniform event envelope and the one event-sending function.

use serde::Serialize;
use tauri::Emitter;
use tauri::WebviewWindow;

/// Event producers — the main event per block: the channel the JS
/// subscribes on.
pub(crate) enum EventKey {
    Chat,
    GroupsChat,
    Providers,
    Settings,
    Workspace,
}

impl EventKey {
    /// The wire name of the main event.
    pub(crate) fn as_str(&self) -> &'static str {
        match self {
            Self::Chat => "event-chat",
            Self::GroupsChat => "event-groups-chat",
            Self::Providers => "event-providers",
            Self::Settings => "event-settings",
            Self::Workspace => "event-workspace",
        }
    }
}

/// The payload bound to its event: the type itself carries the main
/// event and the per-event key of its block. Bindings live in the
/// owner block's `events.rs`.
pub(crate) trait EventPayload: Serialize {
    fn main(&self) -> EventKey;
    fn key(&self) -> &'static str;
}

/// Uniform event payload: the per-event key and the fresh data,
/// serialized to a JSON value — JS receives it already parsed.
#[derive(Serialize, Clone)]
pub(crate) struct EventData {
    pub(crate) key: String,
    pub(crate) value: serde_json::Value,
}

impl EventData {
    /// Builds the payload: the value is serialized to a JSON value;
    /// a failure falls back to `Value::Null`.
    pub(crate) fn new<T: serde::Serialize>(key: &str, value: &T) -> Self {
        Self {
            key: key.to_string(),
            value: serde_json::to_value(value).unwrap_or_default(),
        }
    }
}

/// The one event-sending function: where the event goes is decided
/// by the payload type, not by the caller.
#[allow(non_snake_case)]
pub(crate) fn OkEmit<T: EventPayload>(window: &WebviewWindow, value: T) -> Result<T, String> {
    emit_event(window, value.main(), EventData::new(value.key(), &value));
    Ok(value)
}

/// One event channel per block: any mutation ends with the block's
/// event. The payload is the uniform `{key, value}` envelope. The
/// emit is spawned: it waits for the main thread, so calling it from
/// the main thread (command / window event) deadlocks.
pub(crate) fn emit_event(window: &WebviewWindow, main: EventKey, data: EventData) {
    let event = main.as_str().to_string();
    let window = window.clone();
    tauri::async_runtime::spawn(async move {
        let _ = window.emit(&event, data);
    });
}
