CREATE TABLE chat_history (
    id INTEGER PRIMARY KEY NOT NULL,
    chat_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_history_chat ON chat_history (chat_id);
