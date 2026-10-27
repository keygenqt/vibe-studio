CREATE TABLE groups_chat (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    system_prompt TEXT,
    model_id INTEGER NOT NULL
);
