# AGENTS.md — scripts

Shell utilities of the project. A tool for humans — not application
logic.

## Rules

- A script starts with `source common.sh` and `setup_root`: the work
  always happens from the repository root, no matter where the
  script was launched from.

## List

- `check.sh` — project checks: cargo check and tag coverage.
- `common.sh` — common base: shared features for the other scripts.
- `format.sh` — formats the project, rust & js.
- `reset.sh` — full reset of the project: build artifacts, dependencies and the state database.
- `run.sh` — quick launch of the dev application.
- `stats.sh` — code statistics with filters.
- `tree.sh` — project tree by tags, dir flags `crates`/`react`/`tauri`; no args — all but `misc`/`context` with INFO.
