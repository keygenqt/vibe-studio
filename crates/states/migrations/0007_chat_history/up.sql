CREATE TABLE chat_history (
    id INTEGER PRIMARY KEY NOT NULL,
    chat_id INTEGER NOT NULL,
    provider TEXT NULL,
    model TEXT NULL,
    status TEXT NOT NULL DEFAULT 'complete',
    text TEXT NOT NULL,
    thinking TEXT NULL,
    translate TEXT NULL,
    tokens INTEGER NULL,
    gen_ms INTEGER NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_history_chat ON chat_history (chat_id);
