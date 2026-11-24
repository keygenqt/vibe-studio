// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: Data types of the app block served to the shell.

//! Data types of the app block served to the shell.
//!
//! # Submodules
//!
//! - `app_info` — `AppInfoData`: the app version, debug flag and OS.
//! - `attachment_stat` — `AttachmentStatData`: the draft facts of a
//!   dropped path.
//! - `clipboard_read` — `ClipboardRead`: the kind-tagged clipboard
//!   read answer.

pub(crate) mod app_info;
pub(crate) mod attachment_stat;
pub(crate) mod clipboard_read;
