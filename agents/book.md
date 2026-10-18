# AGENTS.md — book

User-facing documentation of the project, built with mdBook.

## Rules

- Pages live in `book/src/`: documentation in `book/src/docs/`, the
  landing in `book/src/index.html`.
- A new page is registered in `book/src/SUMMARY.md`: an
  unregistered one is invisible to the build, a link without a file
  breaks it.
- A page is self-sufficient: a feature is described on one page,
  no overlap between pages.
