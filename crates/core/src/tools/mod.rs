// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

//! Shell-independent feature helpers: platform facts with no state
//! behind them.
//!
//! # Submodules
//!
//! - `api` — the public surface of the tool helpers.
//! - `theme` — `get_system_theme()` implementation: OS theme
//!   detection (`dark-light`).

pub mod api;
pub(crate) mod theme;
