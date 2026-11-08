// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: Token counting for the store and the cancel token registries.

//! Token counting for the store's `i32` columns and the cancel
//! token registries of the running generations.

use std::collections::HashMap;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::OnceLock;

use studio_cluster::CancelToken;
use studio_cluster::count_tokens;

/// Counts the tokens of the text as the store keeps it: the store's
/// token columns are `i32`.
pub(crate) fn count(text: &str) -> i32 {
    count_tokens(text) as i32
}

/// The active stream tokens by the provider+model pair. Abort
/// handles only: the truth about the running streams lives in the
/// store — the `Progress` rows.
pub(crate) fn stream_tokens() -> &'static Mutex<HashMap<(String, String), Arc<CancelToken>>> {
    static TOKENS: OnceLock<Mutex<HashMap<(String, String), Arc<CancelToken>>>> = OnceLock::new();
    TOKENS.get_or_init(|| Mutex::new(HashMap::new()))
}

/// Cancels the stream token of the provider+model pair, if it runs.
pub(crate) fn cancel_stream_token(key: &(String, String)) {
    if let Some(token) = stream_tokens().lock().expect("stream tokens poisoned").get(key) {
        token.cancel();
    }
}

/// A fresh cancel token for a new stream, Arc-shared with the registry.
pub(crate) fn stream_token() -> Arc<CancelToken> {
    Arc::new(CancelToken::new())
}

/// The active translation tokens by message id — a registry of its
/// own: a translation never cancels a chat answer stream.
pub(crate) fn translate_tokens() -> &'static Mutex<HashMap<i32, Arc<CancelToken>>> {
    static TOKENS: OnceLock<Mutex<HashMap<i32, Arc<CancelToken>>>> = OnceLock::new();
    TOKENS.get_or_init(|| Mutex::new(HashMap::new()))
}

/// Cancels the translation token of the message, if it runs.
pub(crate) fn cancel_translate_token(message_id: i32) {
    if let Some(token) = translate_tokens()
        .lock()
        .expect("translate tokens poisoned")
        .get(&message_id)
    {
        token.cancel();
    }
}

/// Cancels and drops the translation token of the message — the run
/// loses ownership and writes nothing.
pub(crate) fn drop_translate_token(message_id: i32) {
    cancel_translate_token(message_id);
    translate_tokens()
        .lock()
        .expect("translate tokens poisoned")
        .remove(&message_id);
}

/// The active summary tokens by message id — a registry of its own:
/// a summary never cancels a chat answer stream or a translation.
pub(crate) fn summary_tokens() -> &'static Mutex<HashMap<i32, Arc<CancelToken>>> {
    static TOKENS: OnceLock<Mutex<HashMap<i32, Arc<CancelToken>>>> = OnceLock::new();
    TOKENS.get_or_init(|| Mutex::new(HashMap::new()))
}

/// Cancels the summary token of the message, if it runs.
pub(crate) fn cancel_summary_token(message_id: i32) {
    if let Some(token) = summary_tokens()
        .lock()
        .expect("summary tokens poisoned")
        .get(&message_id)
    {
        token.cancel();
    }
}

/// Cancels and drops the summary token of the message — the run
/// loses ownership and writes nothing.
pub(crate) fn drop_summary_token(message_id: i32) {
    cancel_summary_token(message_id);
    summary_tokens()
        .lock()
        .expect("summary tokens poisoned")
        .remove(&message_id);
}
