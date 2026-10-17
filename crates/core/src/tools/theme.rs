// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later

use anyhow::Result;

use vibe_states::ThemeChoice;

/// Detects the OS theme. Falls back to Light when the OS does not
/// specify one.
pub(crate) fn get_system_theme() -> ThemeChoice {
    match dark_light::detect() {
        Ok(dark_light::Mode::Dark) => ThemeChoice::Dark,
        _ => ThemeChoice::Light,
    }
}

/// Resolves the persisted choice to a concrete theme. `System`
/// becomes the detected OS theme.
pub(crate) fn resolve_theme(choice: ThemeChoice) -> ThemeChoice {
    match choice {
        ThemeChoice::System => get_system_theme(),
        resolved => resolved,
    }
}

/// Calls the callback with the OS theme on every change. Spawns a
/// background watcher thread that lives for the app's lifetime.
pub(crate) fn listen_system_theme(on_change: impl Fn(ThemeChoice) + Send + 'static) -> Result<()> {
    let watcher = dark_light::subscribe()?;
    std::thread::spawn(move || {
        for mode in watcher.iter() {
            on_change(match mode {
                dark_light::Mode::Dark => ThemeChoice::Dark,
                _ => ThemeChoice::Light,
            });
        }
    });
    Ok(())
}
