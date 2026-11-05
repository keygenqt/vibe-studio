CREATE TABLE chat_history (
    id INTEGER PRIMARY KEY NOT NULL,
    chat_id INTEGER NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'user',
    provider TEXT NULL,
    model TEXT NULL,
    status TEXT NOT NULL DEFAULT 'complete',
    show_type TEXT NOT NULL DEFAULT 'text',
    text TEXT NOT NULL,
    thinking TEXT NULL,
    translate TEXT NULL,
    summary TEXT NULL,
    tokens_answer INTEGER NULL,
    tokens_thinking INTEGER NULL,
    tokens_translate INTEGER NULL,
    tokens_summary INTEGER NULL,
    tokens_compress INTEGER NULL,
    tokens_gen_ms INTEGER NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    collapsed BOOLEAN NOT NULL DEFAULT 0
);

CREATE INDEX idx_chat_history_chat ON chat_history (chat_id);
