// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The chat compression task: the prompt, the task config and the call.

//! The chat compression task: the whole conversation compressed into
//! a context base for continuing the session. The config is the
//! task's own — the task never uses the model's generation settings.

use anyhow::Result;

use crate::CancelToken;
use crate::ProviderTypeData;
use crate::StreamAnswerData;
use crate::StreamEvent;
use crate::call_prompt_stream;

const COMPRESS_TEMPERATURE: f64 = 0.7;
const COMPRESS_SEED: i64 = 42;
const COMPRESS_NUM_CTX: i32 = 32768;
const COMPRESS_NUM_PREDICT: i32 = 16384;

// the compression instruction: the conversation becomes the sole
// context of the next session — a working document, not a report;
// the language follows the text itself
const COMPRESS_PROMPT: &str = r#"# TASK: CREATE A CONTEXT PACKAGE FOR A NEW SESSION

This session is ending. Create a single Markdown document that will become the sole source of context for a new session.

Critical principle: the new model will see ONLY this document. It knows nothing that is not written here. Write not a progress report, but a working tool for continuing the work.

## RULES

1. Write for an engineer, not a historian. No chronology like "first we..., then we...". Only the actual state at the moment the session ends.
2. No smoothing over. Exact error texts, stack traces, package versions, file and function names — preserve verbatim if still relevant.
3. Reference files, don't duplicate code. Do not include large listings from the repo — only signatures, contracts, and what cannot be read from code.
4. If information is contradictory (a decision changed during the session) — include only the final decision; the cancelled one goes into the "Rejected" section.
5. The document language is the language of the conversation, regardless of the language of these instructions.
6. Cover every turn of the conversation. Each user request and its result must be reflected in the document, however briefly — one uncovered turn is context lost forever.
7. Output format: Markdown, no preamble or closing remarks. Never wrap the document in a fenced code block (```) — the document already contains fenced code blocks of its own.

## MANDATORY DOCUMENT STRUCTURE

### 1. Project and Current Goal

- What we are doing (1-2 sentences), stack, key versions.
- Current task: what exactly is in progress right now, at what stage.

### 2. Current Technical State

- Project structure: relevant files and their roles (paths verbatim).
- Key signatures/contracts/data schemas the work relies on.
- Configuration affecting behavior (env, flags, API limits).

### 3. Accepted Architectural Decisions

- List of decisions that MUST NOT be revisited without a strong reason.
- For each: 1 line — what was decided, 1 line — why.

### 4. Rejected Approaches (CRITICAL)

- Each approach we tried or discussed and rejected.
- Format: what was proposed → why we rejected it (exact reason).
- Section goal: the new model MUST NOT propose this again.

### 5. Non-Obvious Constraints and Workarounds

- Deliberate hacks in the code and their reasons (library bugs, bypasses, API limitations). Format: where the hack is → why it's there → what will happen if it's "fixed".
- Known bugs in external dependencies that influence decisions.

### 6. Unsolved Problems and Open Questions

- Bugs that reproduce but are not fixed: symptoms, hypotheses, what has already been checked (to avoid checking again).
- Questions to the user that remain unanswered.

### 7. TODO

- A numbered list of specific next steps, in order of priority.
- Each item is an actionable task, not an abstraction.

### 8. Irrecoverable from the Repository

- Everything important from this session that CANNOT be recovered by opening the code: agreements, reasons for decisions, experiment results, observations.
- This is the most valuable section — double-check it.

## FINAL SELF-CHECK (perform before output)

1. Can the new model continue working without asking clarifying questions about the previous session's context?
2. Are there no outdated code/requirements versions or cancelled decisions left in the document outside section 4?
3. Is everything in section 8 truly irrecoverable from the repo?
4. Is there no "fluff": if a sentence does not influence the next action — delete it.

The conversation to compress follows as the message history of this request."#;

/// Streams the compression of one conversation into a context base:
/// the deltas go to `on_event` as they arrive, the aggregated answer
/// with the reasoning comes back. The conversation goes as the
/// prompt history.
pub(crate) async fn call_stream(
    provider: ProviderTypeData,
    host: &str,
    api_key: Option<&str>,
    project: Option<&str>,
    model: &str,
    history: Vec<(String, String, Vec<String>)>,
    cancel: &CancelToken,
    on_event: impl Fn(&StreamEvent) + Send + Sync + 'static,
) -> Result<StreamAnswerData> {
    call_prompt_stream(
        provider,
        host,
        api_key,
        project,
        model,
        COMPRESS_TEMPERATURE,
        COMPRESS_SEED,
        COMPRESS_NUM_CTX,
        COMPRESS_NUM_PREDICT,
        None,
        None,
        history,
        COMPRESS_PROMPT,
        cancel,
        on_event,
    )
    .await
}
