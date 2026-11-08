// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['misc']
// INFO: The open code fence balancing for the stream snapshots.

//! The markdown kept whole on the fly: a code fence opened but not
//! yet closed by the stream is closed in the copy for the shell.

/// The markdown kept whole on the fly: a code fence opened but not
/// yet closed by the stream is closed in the copy for the shell —
/// the closer matches the opener's marker and run length. `None`:
/// the text is already balanced, the raw accumulator serves as is.
pub(crate) fn close_open_fence(text: &str) -> Option<String> {
    // the open fence: its marker char and the marker run length
    let mut open: Option<(char, usize)> = None;
    for line in text.lines() {
        let line = line.trim_start();
        let marker = match line.chars().next() {
            Some(c @ ('`' | '~')) => c,
            _ => continue,
        };
        let run = line.chars().take_while(|&c| c == marker).count();
        if run < 3 {
            continue;
        }
        match open {
            // the closer: the same marker, at least the opener's run,
            // nothing else on the line
            Some((open_marker, open_run))
                if marker == open_marker && run >= open_run && line.chars().all(|c| c == marker) =>
            {
                open = None;
            }
            None => open = Some((marker, run)),
            _ => {}
        }
    }
    open.map(|(marker, run)| format!("{text}\n{}", marker.to_string().repeat(run)))
}
