// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: The crate services: the self-contained subsystems with their own state.

//! The crate services: the self-contained subsystems the blocks are
//! served through — the external-world integrations and the
//! stateful machinery.
//!
//! # Submodules
//!
//! - `attachment` — the attachment validation and preparation.
//! - `stream` — the streaming pump: the rate gate and the event loop.
//! - `tokens` — the cancel token registries of the running generations.
//! - `theme` — the OS theme detection with its change watcher.
//! - `clipboard` — the clipboard I/O: text, files and images.

pub(crate) mod attachment;
pub(crate) mod clipboard;
pub(crate) mod stream;
pub(crate) mod theme;
pub(crate) mod tokens;
