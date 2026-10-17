// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use anyhow::Result;

use vibe_states::{Sidebar, Storable, Store};

/// Sidebar constructor. Width is clamped to the allowed range.
pub(crate) fn sidebar(collapsed: bool, width: u32) -> Sidebar {
    Sidebar {
        collapsed,
        width: Sidebar::clamp_width(width),
    }
}

/// Loads sidebar state; missing or malformed data falls back to
/// `Default`.
pub(crate) fn sidebar_load(store: &Store) -> Sidebar {
    Sidebar::load(store)
}

pub(crate) fn sidebar_save(store: &Store, sidebar: &Sidebar) -> Result<()> {
    sidebar.save(store)
}
