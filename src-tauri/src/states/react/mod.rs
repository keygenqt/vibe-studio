// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! The JS mirror: commands the UI invokes and the event channel
//! back to it.
//!
//! # Submodules
//!
//! - `provider` — the provider catalog and CRUD commands.
//! - `view` — the single `event-state` channel to the UI.
//! - `workspace` — the shell environment commands.

pub(crate) mod provider;
pub(crate) mod view;
pub(crate) mod workspace;
