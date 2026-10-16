// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use std::fs;
use std::path::Path;

use anyhow::Result;

use crate::constants::SETTINGS_FILE;
use crate::state::Settings;

pub fn load(dir: &Path) -> Settings {
    let path = dir.join(SETTINGS_FILE);
    match fs::read_to_string(&path) {
        Ok(data) => serde_json::from_str(&data).unwrap_or_default(),
        Err(_) => Settings::default(),
    }
}

pub fn save(dir: &Path, settings: &Settings) -> Result<()> {
    fs::create_dir_all(dir)?;
    fs::write(dir.join(SETTINGS_FILE), serde_json::to_string_pretty(settings)?)?;
    Ok(())
}
