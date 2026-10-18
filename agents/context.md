# AGENTS.md — context

Tag system: file paths by task. Tags let an assistant receive the
project slice it needs instead of the whole tree; the scanner is
`context/tags.js`.

## Tags

- A tag names a task: the work that brings you to the file — not
  where it lives or what it is. A tag answers "I want to do X — which
  files do I open"; the catalog entries are derived from the
  project's real recurring tasks. A file serves a task in any role —
  defining, using, supporting it.
- The catalog below is closed: a tag exists only if listed here, and
  extending the catalog is a deliberate change to this file. A file
  may carry several tags when it serves several tasks.
- Tags are maintained by a human. An assistant points out a wrong or
  stale tag, proposes a new one when needed; a human applies the
  changes.
- Semantics are soft: a stale tag only adds a stray file to a slice.
  Coverage is hard: `--check` fails on an untagged file, on a
  conflict (tagged in both places), on a dead entry in `tags.json`,
  and on a header with TAGS but no SPDX lines.

### Catalog

- `states` — add or change a persisted state structure, or the UI that uses it
- `i18n` — add or change a translation
- `theme` — change the theme or the files that define it
- `deps` — update or add package dependencies
- `components` — add or change a component or layout
- `hooks` — add or change a hook
- `context` — work on the tag system and the LLM contracts
- `facts` — add or change app versions, constants and platform facts
- `misc` — work not covered by any task above

## Format

- An in-file tag is a `TAGS: ['task', ...]` line in the SPDX header,
  in the comment syntax of the language; the scanner looks for it in
  the first 10 lines of a file.
- In-file tags are for `.js/.jsx/.rs` only; the set is the
  `IN_FILE_LANGS` constant in the scanner — extend there. Every other
  file is a permanent resident of `context/tags.json`.

## Workflow

- A new file gets all the tags describing its work at creation, not
  just one; the live tag catalog is the output of
  `node context/tags.js --tags`.
- A new untaggable file type goes to `tags.json`, a new language to
  `IN_FILE_LANGS`.
- The untagged list from `--check` is the work queue.

## Invocation

```bash
node context/tags.js --tags        # tag catalog: tag and file count
node context/tags.js <tags...>     # file tree for files with any of these tags
node context/tags.js --check       # fails on untagged files, conflicts, dead entries
```
