// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: Private helpers of the core functions.

use std::collections::HashMap;
use std::sync::Arc;
use std::sync::Mutex;
use std::sync::OnceLock;

use studio_cluster::CancelToken;

use crate::ChatHistoryData;

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

/// The wire role of a stored message: the sender without a model is
/// the user.
pub(crate) fn history_role(message: &ChatHistoryData) -> String {
    if message.model.is_none() {
        "user".to_string()
    } else {
        "assistant".to_string()
    }
}
