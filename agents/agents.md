# AGENTS.md — agents

Rules of the agents/ directory itself: how the rule files are
written and maintained.

## Files

- One file per root directory — a project fragment. A file describes
  only its own directory — no overlap between files.
- Structural root files (Cargo.toml, package.json, ...) follow
  framework rules and stay outside this contract.

## Content

- First line is the passport: title plus a one-sentence description.
  The root AGENTS.md index quotes it.
- Invariants only. A fact visible from the code does not belong
  here.
- A rule lives with the code of its directory: a commit that changes
  the directory updates its rule file; the directory is deleted —
  the file goes with it.

## Related

- Tags and context slices: `context.md`.
