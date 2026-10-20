// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

//! Tauri-internal features: no commands, no JS surface.
//!
//! # Submodules
//!
//! - `workspace` — `restore` / `save`: the window size between the
//!   OS window and the `Workspace` state.

pub(crate) mod workspace;
