// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']

use crate::state::storable::Storable;

pub const SIDEBAR_WIDTH_MIN: u32 = 200;
pub const SIDEBAR_WIDTH_MAX: u32 = 480;
pub const SIDEBAR_WIDTH_DEFAULT: u32 = 260;

#[derive(Debug, Clone, Copy, serde::Serialize, serde::Deserialize)]
pub struct Sidebar {
    pub collapsed: bool,
    pub width: u32,
}

impl Default for Sidebar {
    fn default() -> Self {
        Self {
            collapsed: false,
            width: SIDEBAR_WIDTH_DEFAULT,
        }
    }
}

impl Sidebar {
    pub fn clamp_width(width: u32) -> u32 {
        width.clamp(SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX)
    }
}

impl Storable for Sidebar {
    const KEY: &'static str = "sidebar";
}
