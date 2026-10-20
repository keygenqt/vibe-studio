// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! Application states relay: the JS mirror, the store bootstrap and
//! the Tauri-internal window features.
//!
//! # Submodules
//!
//! - `react` — the JS mirror: state commands, the `StateView`
//!   snapshot and the `event-state` channel.
//! - `storage` — `store()`: opens the state store in the app data
//!   directory for `app.manage()`.
//! - `tauri` — Tauri-internal features with no JS surface: the
//!   window size persistence.

pub(crate) mod react;
pub(crate) mod storage;
pub(crate) mod tauri;
