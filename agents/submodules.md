# AGENTS.md — submodules

External repositories connected as git submodules: build-time dependencies outside the app code.

## Rules

- One directory — one external repository; nothing app-owned lives here.
- A submodule is consumed by a path dependency from the crate that uses it; the pin is fixed by a commit in this repository.
- An update is deliberate: `git submodule update --remote` plus a pin commit; a fresh clone needs `git submodule update --init`.

## vibe-cluster

- The multi-provider LLM cluster library: one API over local and cloud
  providers — Ollama, OpenAI-compatible APIs, GigaChat.
- What the app takes from it: the static provider and model catalog,
  capability matrix, prompt calls with streaming, usage stats.
- Development of the library happens in its own repository: changes are
  pushed there first, then the pin moves here.
