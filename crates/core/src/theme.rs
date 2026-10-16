// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use crate::state::Theme;
use crate::state::ThemeOverride;

/// Manual override wins, otherwise follow the system.
pub fn resolve(theme_override: Option<ThemeOverride>, system: Theme) -> Theme {
    match theme_override {
        Some(ThemeOverride::Dark) => Theme::Dark,
        Some(ThemeOverride::Light) => Theme::Light,
        None => system,
    }
}
