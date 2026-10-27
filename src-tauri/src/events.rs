// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use tauri::Emitter;
use tauri::WebviewWindow;

use crate::data::event_data::EventData;

/// Event channel names — one per block.
pub(crate) const EVENT_WORKSPACE: &str = "event-workspace";
pub(crate) const EVENT_PROVIDERS: &str = "event-providers";
pub(crate) const EVENT_APP: &str = "event-app";

/// Workspace mutations end with the fresh stored row.
pub(crate) fn emit_event_workspace(window: &WebviewWindow, value: EventData) {
    emit_event(window, EVENT_WORKSPACE, value);
}

/// Provider-block mutations end with the fresh state: the
/// providers list, or the model list of one provider.
pub(crate) fn emit_event_providers(window: &WebviewWindow, value: EventData) {
    emit_event(window, EVENT_PROVIDERS, value);
}

/// The OS theme watcher reports the current theme.
pub(crate) fn emit_event_app(window: &WebviewWindow, value: EventData) {
    emit_event(window, EVENT_APP, value);
}

/// One event channel per block: any mutation ends with the block's
/// event. The payload is the uniform `{key, value}` envelope. The
/// emit is spawned: it waits for the main thread, so calling it from
/// the main thread (command / window event) deadlocks.
fn emit_event(window: &WebviewWindow, event: &str, value: EventData) {
    let event = event.to_string();
    let window = window.clone();
    tauri::async_runtime::spawn(async move {
        let _ = window.emit(&event, value);
    });
}
