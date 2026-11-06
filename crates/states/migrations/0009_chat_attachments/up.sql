CREATE TABLE chat_attachments (
    id INTEGER PRIMARY KEY NOT NULL,
    message_id INTEGER NOT NULL
        REFERENCES chat_history (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    data BLOB NOT NULL
);

CREATE INDEX idx_chat_attachments_message ON chat_attachments (message_id);
