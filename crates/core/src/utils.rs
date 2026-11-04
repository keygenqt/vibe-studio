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

/// The prompt language name of a locale code; an unknown code reads
/// as English.
pub(crate) fn locale_language(locale: &str) -> &'static str {
    match locale {
        "ru" => "Russian",
        "cn" => "Chinese",
        _ => "English",
    }
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

/// The markdown kept whole on the fly: a code fence opened but not
/// yet closed by the stream is closed in the copy for the shell —
/// the closer matches the opener's marker and run length. `None`:
/// the text is already balanced, the raw accumulator serves as is.
pub(crate) fn close_open_fence(text: &str) -> Option<String> {
    // the open fence: its marker char and the marker run length
    let mut open: Option<(char, usize)> = None;
    for line in text.lines() {
        let line = line.trim_start();
        let marker = match line.chars().next() {
            Some(c @ ('`' | '~')) => c,
            _ => continue,
        };
        let run = line.chars().take_while(|&c| c == marker).count();
        if run < 3 {
            continue;
        }
        match open {
            // the closer: the same marker, at least the opener's run,
            // nothing else on the line
            Some((open_marker, open_run))
                if marker == open_marker && run >= open_run && line.chars().all(|c| c == marker) =>
            {
                open = None;
            }
            None => open = Some((marker, run)),
            _ => {}
        }
    }
    open.map(|(marker, run)| format!("{text}\n{}", marker.to_string().repeat(run)))
}
