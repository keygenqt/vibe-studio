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
- A single state listener: `useEffectStateSync` — snapshot +
  `event-state`. Features only invoke.
- Effect hooks are named `useEffect*`, state-owner hooks live next to
  them (`src/base/hooks`).
- i18n: a key is added to all locales at once (ru / en / cn).

## Style

- Styling through `sx={{}}` on MUI components; colors are theme
  tokens; spacing in theme units, not raw px.
- Constants are the rare exception; inline literals by default.
- PropTypes on components.
