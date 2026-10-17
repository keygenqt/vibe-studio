// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use std::sync::Mutex;

use vibe_states::{Settings, ThemeChoice};

/// Global application state. Rust owns it, React only mirrors it.
#[derive(Default)]
pub struct AppState {
    pub settings: Mutex<Settings>,
}

#[derive(serde::Serialize, Clone)]
pub struct StateView {
    pub theme: ThemeChoice,
    pub settings: Settings,
}
