// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use crate::state::storable::Storable;

/// User arrangement of the UI shell: panel sizes and collapsed flag.
/// `None` means the value was never touched — the UI shell resolves
/// its own default.
#[derive(Debug, Clone, Copy, Default, serde::Serialize, serde::Deserialize)]
pub struct Workspace {
    pub chat_input_size: Option<u32>,
    pub side_bar_size: Option<u32>,
    pub side_bar_collapsed: bool,
}

impl Storable for Workspace {
    const KEY: &'static str = "workspace";
}
