// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: The single streaming pump: the shared rate gate and the event loop.

//! The single streaming pump: both stream calls (the chat answer and
//! the translation) run their deltas through it. Everything crossing
//! the gate is a whole snapshot — a dropped tick loses a frame,
//! never data.

use std::future::Future;
use std::time::Duration;
use std::time::Instant;

use anyhow::Result;

use crate::StreamEvent;

/// The shell copy refreshes at most once per this interval; the
/// first chunk passes at once.
pub(crate) const SNAPSHOT_INTERVAL_MS: u64 = 32;

/// The emit gate of a stream: the first chunk goes at once, the
/// rest — at most once per interval.
#[derive(Default)]
pub(crate) struct StreamGate {
    emitted_at: Option<Instant>,
}

impl StreamGate {
    /// Passes when the interval elapsed since the last pass. The
    /// cadence yields to the payload: a big snapshot costs more to
    /// paint, so the interval grows with the text length.
    pub(crate) fn pass(&mut self, chars: usize) -> bool {
        let interval = (chars as u64 / 128).clamp(SNAPSHOT_INTERVAL_MS, 250);
        let now = Instant::now();
        if self
            .emitted_at
            .is_some_and(|at| now.duration_since(at) < Duration::from_millis(interval))
        {
            return false;
        }
        self.emitted_at = Some(now);
        true
    }
}

/// Pumps the cluster deltas while the call future runs and drains
/// the leftovers after it resolves; every delta goes through
/// `on_event`. Returns the call outcome.
pub(crate) async fn pump<T, Fut, F>(
    mut call: Fut,
    rx: &mut tokio::sync::mpsc::UnboundedReceiver<StreamEvent>,
    mut on_event: F,
) -> Result<T>
where
    Fut: Future<Output = T> + Unpin,
    F: FnMut(StreamEvent) -> Result<()>,
{
    // a closed channel disables the rx arm: the senders are gone and
    // the call resolves on its own — the arm must not spin on None
    let mut rx_closed = false;
    let outcome = loop {
        tokio::select! {
            biased;
            delta = rx.recv(), if !rx_closed => match delta {
                Some(event) => on_event(event)?,
                None => rx_closed = true,
            },
            done = &mut call => break done,
        }
    };
    // the deltas that arrived before the call future resolved
    while let Ok(event) = rx.try_recv() {
        on_event(event)?;
    }
    Ok(outcome)
}
