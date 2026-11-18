// SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
// SPDX-License-Identifier: AGPL-3.0-or-later
// TAGS: ['states']
// INFO: The chat block commands: history, streams and message mutations.

use tauri::AppHandle;
use tauri::Manager;
use tauri::State;
use tauri::WebviewWindow;
use tauri::ipc::Channel;

use studio_core::ChatAttachmentInput;
use studio_core::ChatShowType;
use studio_core::ChatStreamEvent;
use studio_core::Store;

use super::data::chat_state::ChatStateData;
use super::data::chat_stats::ChatStatsData;
use super::data::stream_chunk::StreamChunk;
use super::data::stream_chunk::StreamChunkKind;
use crate::events::OkEmit;

/// The fresh state of the chat block: the chat row, its usage stats
/// and the message history, oldest first.
#[tauri::command]
pub fn chat_get_history(store: State<Store>, chat_id: i32) -> Result<ChatStateData, String> {
    studio_core::chat_get_history(&store, chat_id).map_err(|e| e.to_string())?;
    Ok(ChatStateData::new(&store, chat_id))
}

/// Forwards the core stream events to the shell: the stored state
/// rides the block event, the live snapshots — the command channel.
fn chat_stream_forwarder(
    window: WebviewWindow,
    on_delta: Channel<StreamChunk>,
) -> impl Fn(ChatStreamEvent) + Send + Sync + 'static {
    move |event| match event {
        ChatStreamEvent::UserStored { chat, history } => {
            // the state is in the event's hands: emit it, no re-read
            let state = ChatStateData {
                chat,
                stats: ChatStatsData::of(&history),
                history,
            };
            let _ = OkEmit(&window, state);
        }
        ChatStreamEvent::TextSnapshot(text) => {
            let _ = on_delta.send(StreamChunk {
                kind: StreamChunkKind::Text,
                text,
            });
        }
        ChatStreamEvent::Thinking(text) => {
            let _ = on_delta.send(StreamChunk {
                kind: StreamChunkKind::Thinking,
                text,
            });
        }
    }
}

/// Sends the user's message to the chat's model and records the
/// exchange; the stream snapshots go to `on_delta`, every stored
/// state ends with the event. `translate` swaps the text for its
/// translation before anything is stored. Returns the fresh state of
/// the chat block.
#[tauri::command]
pub async fn chat_send_message(
    window: WebviewWindow,
    store: State<'_, Store>,
    chat_id: i32,
    text: String,
    translate: bool,
    attachments: Vec<ChatAttachmentInput>,
    on_delta: Channel<StreamChunk>,
) -> Result<ChatStateData, String> {
    studio_core::chat_send_message(
        &store,
        chat_id,
        &text,
        translate,
        attachments,
        chat_stream_forwarder(window.clone(), on_delta),
    )
    .await
    .map_err(|e| e.to_string())?;
    OkEmit(&window, ChatStateData::new(&store, chat_id))
}

/// Cancels the running stream of the chat's model, if any; the
/// stream task finalizes its row and its command returns the state.
#[tauri::command]
pub fn chat_cancel_send(store: State<Store>, chat_id: i32) -> Result<(), String> {
    studio_core::chat_cancel_send(&store, chat_id).map_err(|e| e.to_string())
}

/// Persists the show type of the message bubble; emits and returns
/// the fresh state of the chat block. Switching to the summary view
/// of a message without a summary spawns the background
/// summarization: when it lands, the block event carries the fresh
/// state.
#[tauri::command]
pub fn chat_set_message_show_type(
    app: AppHandle,
    window: WebviewWindow,
    store: State<Store>,
    chat_id: i32,
    message_id: i32,
    show_type: ChatShowType,
) -> Result<ChatStateData, String> {
    studio_core::chat_set_message_show_type(&store, chat_id, message_id, show_type).map_err(|e| e.to_string())?;
    // the summarization runs detached: the switch answers at once,
    // the summary arrives later through the block event
    if show_type == ChatShowType::Summary && studio_core::get_settings(&store).tasks_model_light.is_some() {
        let handle = app.clone();
        let window = window.clone();
        tauri::async_runtime::spawn(async move {
            let store = handle.state::<Store>();
            let _ = OkEmit(&window, ChatStateData::new(&store, chat_id));
        });
    }
    OkEmit(&window, ChatStateData::new(&store, chat_id))
}

/// Persists the collapsed view flag of the message bubble; emits and
/// returns the fresh state of the chat block.
#[tauri::command]
pub fn chat_set_message_collapsed(
    window: WebviewWindow,
    store: State<Store>,
    chat_id: i32,
    message_id: i32,
    collapsed: bool,
) -> Result<ChatStateData, String> {
    studio_core::chat_set_message_collapsed(&store, chat_id, message_id, collapsed).map_err(|e| e.to_string())?;
    OkEmit(&window, ChatStateData::new(&store, chat_id))
}

/// Deletes the message with everything below it; emits and returns
/// the fresh state of the chat block.
#[tauri::command]
pub fn chat_delete_message(
    window: WebviewWindow,
    store: State<Store>,
    chat_id: i32,
    message_id: i32,
) -> Result<ChatStateData, String> {
    studio_core::chat_delete_message(&store, chat_id, message_id).map_err(|e| e.to_string())?;
    OkEmit(&window, ChatStateData::new(&store, chat_id))
}

/// Resends the user's message: everything below it is deleted and
/// the message goes through the send path again; the stream deltas
/// go to `on_delta`, every stored state ends with the event.
/// Returns the fresh state of the chat block.
#[tauri::command]
pub async fn chat_resend_message(
    window: WebviewWindow,
    store: State<'_, Store>,
    chat_id: i32,
    message_id: i32,
    on_delta: Channel<StreamChunk>,
) -> Result<ChatStateData, String> {
    studio_core::chat_resend_message(
        &store,
        chat_id,
        message_id,
        chat_stream_forwarder(window.clone(), on_delta),
    )
    .await
    .map_err(|e| e.to_string())?;
    OkEmit(&window, ChatStateData::new(&store, chat_id))
}

/// Translates the model answer; the text deltas go to `on_delta`
/// when the streaming output is on. Emits and returns the fresh
/// state of the chat block.
#[tauri::command]
pub async fn chat_translate_message(
    window: WebviewWindow,
    store: State<'_, Store>,
    chat_id: i32,
    message_id: i32,
    on_delta: Channel<StreamChunk>,
) -> Result<ChatStateData, String> {
    studio_core::chat_translate_message(&store, chat_id, message_id, move |text| {
        let _ = on_delta.send(StreamChunk {
            kind: StreamChunkKind::Text,
            text: text.to_string(),
        });
    })
    .await
    .map_err(|e| e.to_string())?;
    OkEmit(&window, ChatStateData::new(&store, chat_id))
}

/// Compresses the chat history into one context-base message; the
/// stream snapshots go to `on_delta` like a model answer, the
/// attempt rides the `UserStored` event. A cancelled run answers
/// without an error — the cleanup event returns the history.
/// Returns the fresh state of the chat block.
#[tauri::command]
pub async fn chat_compress_message(
    window: WebviewWindow,
    store: State<'_, Store>,
    chat_id: i32,
    use_task_model: bool,
    on_delta: Channel<StreamChunk>,
) -> Result<ChatStateData, String> {
    // the fresh state in any outcome: an error or a cancel deletes
    // the attempt — the shell must see the history return
    let result = studio_core::chat_compress_message(
        &store,
        chat_id,
        use_task_model,
        chat_stream_forwarder(window.clone(), on_delta),
    )
    .await;
    result.map_err(|e| e.to_string())?;
    OkEmit(&window, ChatStateData::new(&store, chat_id))
}
