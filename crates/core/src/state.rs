// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use std::sync::Mutex;

#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ThemeOverride {
    Light,
    Dark,
}

/// Resolved theme: manual override, or system default.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Light,
    Dark,
}

fn default_locale() -> String {
    "ru".into()
}

fn default_panel_width() -> u32 {
    420
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Settings {
    /// None = follow system theme
    #[serde(default)]
    pub theme: Option<ThemeOverride>,
    #[serde(default = "default_locale")]
    pub locale: String,
    /// Chat panel width, px
    #[serde(default = "default_panel_width")]
    pub panel_width: u32,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            theme: None,
            locale: default_locale(),
            panel_width: default_panel_width(),
        }
    }
}

/// Global application state. Rust owns it, React only mirrors it.
#[derive(Default)]
pub struct AppState {
    pub settings: Mutex<Settings>,
}

#[derive(serde::Serialize, Clone)]
pub struct StateView {
    pub theme: Theme,
    pub settings: Settings,
}
