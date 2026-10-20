# AGENTS.md — src

React frontend. A thin layer: Rust is the source of truth, JS holds
copies only for rendering.

## Rules

- All Rust calls go through `Methods` (`src/modules`): one method —
  one command.
- Rust validates and clamps; what it returns is what gets applied
  after `invoke` — the local optimistic value is only a preview.
- Two theme contracts, never mix: the UI applies the stored choice
  (`settings.theme`, may be `system`) and renders from the resolved
  `theme`.
- Redux is only for UI-specific tasks; the application state lives in
  Rust and arrives as a snapshot and `event-state`.
- A single state listener: `initStateSync` (`src/init`) — snapshot +
  `event-state`. Features only invoke.
- Effect hooks are named `useEffect*`, state-owner hooks live next to
  them (`src/hooks`). A hook is only for what is tied to a component
  lifetime; app-wide startup code lives in `src/init` as `init*`,
  called once from `main.jsx` — no cleanup, no remount semantics.
- i18n: a key is added to all locales at once (ru / en / cn).

## Structure

- Two essences. An element is a part of its parent; a component is a
  unit that lives its own life, even while used by a single page.
- A page is `pages/<page>/<Page>.jsx`: the route entry and its
  composition; its parts live in the page `elements/`.
- Init modules live in `src/init/<initName>.js`: run once at startup
  from `main.jsx`, global side effects only, nothing else exported.
- Components live under `components/<type>/`. Types are added as
  logical blocks: when same-kind logic starts to duplicate inside
  `views`, it is split into its own type folder. `views` is the
  fallback when the type is unclear.
- A component with children: `<type>/<Name>/<Name>.jsx` plus its
  `elements/`. A childless component is a bare file
  `<type>/<Name>.jsx`. Folder name equals file name; the type is a
  name suffix (`TooltipIconButton`, `EmptyState`, `ShellLayout`).
- `elements/` holds the nodes of its parent; the nesting is exactly
  one level — an element never gets its own `elements/`.
- Every top-level zone has an `index.js` barrel. Consumers import
  through the zone barrel; inside a zone — relative paths.

## Style

- `.jsx` only when the file itself contains JSX markup; everything
  else (barrels, hooks, themes, store, modules, init) is `.js`.
- Styling through `sx={{}}` on MUI components; colors are theme
  tokens; spacing in theme units, not raw px.
- Constants are the rare exception; inline literals by default.
- PropTypes on components.
