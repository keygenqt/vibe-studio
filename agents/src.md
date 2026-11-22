# AGENTS.md — src

React frontend. A thin layer: Rust is the source of truth, JS holds
copies only for rendering.

## Rules

- `constants/` holds the UI defaults: the copy resolves untouched
  null values on landing; the database stores only what the user
  chose.
- Forms are Formik + Yup: client validation is UX, Rust re-validates
  on commit.
- i18n: three locales — ru/en/cn. Blocks mirror `pages/`: one section
  per page (`providers`, `provider`, `models`, `model`, `general`),
  shell keys in `settings`; a key with one consumer lives in its
  block, a shared one — in `common`; a new key lands in all three
  locales in one commit.

## Core

`core/` is the JS-Rust layer, assembled from blocks. A block is a
`<block>/` directory carrying files by role: the role defines the
file, not a fixed set. The public surface of a block is its
`index.js` barrel (method, hooks); pages import from the block
barrels directly.

- `store` — **the copy only**: the block slice and the whole-payload
  `xxxStateSet` reducers. No request logic and no knowledge of
  Tauri.
- `tauri` — **the connection and the only writer of the copy from
  Rust**: invoke wrappers and channels; the state listen routes the
  payload key to dispatch. The event keys are mirrored in the
  block's own `tauri.js` from the owner block's `events.rs` — no
  shared registry is kept. Collection mutations leave the answer
  undispatched — the event carries the fresh block state.
- `method` — **mutations only**. No `get*`, no requests whose result
  the page needs to show — those belong to the hook. A merged save
  (`save`) merges the patch into the copy, dispatches it (instant
  UI) and sends it whole; the event confirms. A save sends the copy
  as resolved — untouched fields land with their UI defaults.
  Errors are rethrown to the caller.
- `use*` — **all reading**, lives in the block's `hooks/`. One hook —
  one meaning: a collection, a routed row, a choice; the block's
  mount loads live here, the page gets its render data only from the
  hooks. Splitting follows growth: a base hook is not required when
  the meanings stand alone. A hook may return a derived `ready`
  (a null check of its own data) — the page gate; the only stored
  readiness flag is `app` (`useAppReady`), it opens the shell.
- **Query hooks** `use<Query>` — one-shot requests whose result
  lives on a single screen: local state, local error, refetched on
  every mount. They touch no store and no `method` and call Tauri
  directly. The name follows the meaning of the requested data, not
  the command name. The criterion for moving a read out is data
  ownership: a load that writes the block copy belongs to the block
  hook; the answer to a screen's request belongs to a query hook.
  A query hook lives in its block's directory. The inverse check:
  a copy field with a single screen consumer is a misplaced query —
  it belongs to a query hook's local state, not to the store.
- **Errors are always obtainable**: a mount load holds its error
  locally and returns it from the hook, a query hook holds its error
  locally, a mutation rethrows its failure to the caller. No error
  ever disappears silently.
- **Pure UI state** — the `ui` block: one per app, it gathers the
  state that lives only in the frontend and has no owner in the Rust
  store or the database (interface flags like `formSuccess`). Such a
  block carries only `store`, `method` and hooks — no `tauri`; new
  pure UI state lands here, not in the data blocks.

## Hooks

- `hooks/` — shared React hooks without block data: no copies, no
  dispatch, no block command invokes; side effects target the
  environment only (DOM, window, timers).

## Navigation

- Page paths live in `constants/AppRoutes.js`: a call without
  arguments gives the router pattern, with an id — the concrete URL.
- All navigation goes through `AppNav` (`src/utils`): `open`,
  `openWithReplace`, `back`, `backTo`. A bare `navigate(path)`
  around it breaks the transition journal.
- A mutation returning to the page it came from is a `back`: the
  journal stays clean, no duplicated slots.

## Loading

- A page with data loading gates its content in `WaitState`
  (`components/states`): readiness is the block hook's `ready`.
- A block error is shown by `!ready && error`: the hook's local
  error; a fresh load cleans it.
- **Errors have two surfaces**: page-scoped errors — failed loads and
  mutations — surface as `ErrorSnackbar` (`components/snackbars`);
  form errors — a failed commit — surface as `ErrorAlert`
  (`components/alerts`) inside the form.
- One row — one command: a page fetches its item by id, never
  derives it from the collection list; the read-through row maps
  are re-synced with the fresh collections on a block event, a row
  missing from the table is refetched on the next open.

## Structure

- A component is a unit that lives its own life; its home follows its
  consumers: shell-wide — `layouts/components/`, shared by pages —
  `pages/components/<type>/`, a single page — `pages/<page>/components/`.
- An element is a part of its parent (`elements/`, nesting exactly
  one level).
- A page is `pages/<page>/<Page>.jsx`: the route entry and its
  composition; a layout page hosts children through `Outlet`.
- Every top-level zone has an `index.js` barrel; consumers import
  through the zone barrel, inside a zone — relative paths.

## Style

- `.jsx` only for files with JSX markup; everything else — `.js`.
- Styling: `sx={{}}` on MUI, colors as theme tokens, spacing in
  theme units.
- PropTypes on components; constants are the rare exception,
  inline literals by default.
