// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: Data types of the app block served to the shell.

//! Data types of the app block served to the shell.
//!
//! # Submodules
//!
//! - `app_info` — `AppInfoData`: the app version, debug flag and OS.
//! - `attachment_item` — `AttachmentItemData`: the draft items of
//!   the dropped paths.
//! - `clipboard_read` — `ClipboardRead`: the kind-tagged clipboard
//!   read answer.

pub(crate) mod app_info;
pub(crate) mod attachment_item;
pub(crate) mod clipboard_read;
