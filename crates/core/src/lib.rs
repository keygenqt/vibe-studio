// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

//! Vibe Studio core — facade over sub-crates. UI shells talk to this
//! crate only.

pub(crate) mod states;
pub(crate) mod tools;

pub use states::api::*;
pub use tools::api::*;
