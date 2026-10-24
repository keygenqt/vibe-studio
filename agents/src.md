# AGENTS.md — src

React frontend. A thin layer: Rust is the source of truth, JS holds
copies only for rendering.

## Rules

- All Rust calls go through `Methods` (`src/modules`): one method —
  one command.
- Rust validates and clamps; after `invoke` what it returned is what
  gets applied — the optimistic value is only a preview.
- The application state lives in Rust and arrives as a snapshot and
  `event-state` (`initStateSync`, `src/init`); Redux is only for
  UI-specific tasks.
- Forms are Formik + Yup: client validation is UX, Rust re-validates
  on commit.
- i18n: three locales — ru/en/cn.

## Navigation

- Page paths live in `constants/AppRoutes.js`: a call without
  arguments gives the router pattern, with an id — the concrete URL.
- All navigation goes through `AppNav` (`src/utils`): `open`,
  `openWithReplace`, `back`, `backTo`. A bare `navigate(path)`
  around it breaks the transition journal.

## Structure

- An element is a part of its parent (`elements/`, nesting exactly
  one level); a component is a unit that lives its own life
  (`components/<type>/`). `views` is the nursery: a second instance
  of a kind is the trigger to move it to its own folder.
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
