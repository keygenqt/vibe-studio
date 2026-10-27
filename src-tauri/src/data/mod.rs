// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']

//! Data types of the UI layer served to the shell.
//!
//! # Submodules
//!
//! - `app_info` — `AppInfoData`: the app version and debug flag.
//! - `event_data` — `EventKey` and `EventData`: the uniform event
//!   payload of the event channels.

pub(crate) mod app_info;
pub(crate) mod event_data;
