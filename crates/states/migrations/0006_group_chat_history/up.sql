CREATE TABLE group_chat_history (
    group_chat_id INTEGER PRIMARY KEY NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_collapsed_group INTEGER NOT NULL DEFAULT 0,
    current_collapsed_chats INTEGER NOT NULL DEFAULT 1,
    current_active_chat_id INTEGER NOT NULL DEFAULT 0,
    current_is_active INTEGER NOT NULL DEFAULT 0,
    count_updates INTEGER NOT NULL DEFAULT 0,
    count_activations INTEGER NOT NULL DEFAULT 0,
    count_chats_created INTEGER NOT NULL DEFAULT 0
);

-- at most one active group, enforced by the schema
CREATE UNIQUE INDEX idx_group_chat_history_active
    ON group_chat_history (current_is_active) WHERE current_is_active = 1;

-- the selected chat lives only on the active row
CREATE UNIQUE INDEX idx_group_chat_history_active_chat
    ON group_chat_history (current_active_chat_id) WHERE current_active_chat_id != 0;
