// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['facts']
// INFO: The full capability matrix of a model, mirrored from vibe_cluster.

use vibe_cluster::Capabilities;

/// The full capability matrix of a model: input/output modalities and
/// abilities, as the host reports them or the rules resolve them.
/// Fields the source does not define stay `None`.
#[derive(Debug, Clone, Default, serde::Serialize)]
pub struct ModeCapabilityData {
    /// Accepts text prompts.
    pub input_text: Option<bool>,
    /// Accepts images.
    pub input_vision: Option<bool>,
    /// Accepts audio.
    pub input_audio: Option<bool>,
    /// Accepts video.
    pub input_video: Option<bool>,
    /// Produces text.
    pub output_text: Option<bool>,
    /// Generates images.
    pub output_image: Option<bool>,
    /// Generates audio (TTS, speech).
    pub output_audio: Option<bool>,
    /// Generates video.
    pub output_video: Option<bool>,
    /// Supports tool (function) calling.
    pub tools: Option<bool>,
    /// Produces reasoning (thinking) output.
    pub thinking: Option<bool>,
    /// Produces embeddings, not chat completions.
    pub embedding: Option<bool>,
    /// System One classification (Ollama `decision`).
    pub decision: Option<bool>,
}

impl From<Capabilities> for ModeCapabilityData {
    fn from(caps: Capabilities) -> Self {
        ModeCapabilityData {
            input_text: caps.input.text,
            input_vision: caps.input.vision,
            input_audio: caps.input.audio,
            input_video: caps.input.video,
            output_text: caps.output.text,
            output_image: caps.output.image,
            output_audio: caps.output.audio,
            output_video: caps.output.video,
            tools: caps.abilities.tools,
            thinking: caps.abilities.thinking,
            embedding: caps.abilities.embedding,
            decision: caps.abilities.decision,
        }
    }
}
