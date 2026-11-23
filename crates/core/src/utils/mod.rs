// INFO: Self-sufficient helpers of the core functions.

//! Self-sufficient helpers of the core functions: stateless, called
//! from anywhere, no connections of their own.
//!
//! # Submodules
//!
//! - `browser` — opening http/https links in the default browser.
//! - `fence` — the open code fence balancing for the stream snapshots.
//! - `prompt` — the wire role of a stored message and the prompt language name.

mod browser;
mod fence;
mod prompt;

pub(crate) use browser::open_in_browser;
pub(crate) use fence::close_open_fence;
pub(crate) use prompt::history_role;
pub(crate) use prompt::locale_language;
